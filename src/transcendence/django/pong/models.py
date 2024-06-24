import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

def file_size_validator(file):
	if file.size > settings.MAX_UPLOAD_SIZE:
		raise ValidationError('File size exceeds the 5 MiB limit.')

class AutoDateTimeField(models.DateTimeField):
	def pre_save(self, model_instance, add):
		return timezone.now()

class IntraUserManager(BaseUserManager):
	def create_user(self, intra_name):
		user = self.model(
			intra_name = intra_name,
		)
		user.is_superuser = False
		user.save(using=self._db)
		return user

	def create_superuser(self, intra_name):
		user = self.model(
			intra_name = intra_name,
		)
		user.is_superuser = True
		user.save(using=self._db)
		return user

class User(AbstractBaseUser):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	intra_name = models.CharField(max_length=150, unique=True)

	objects = IntraUserManager()
	USERNAME_FIELD = "intra_name"

	display_name = models.CharField(max_length=150, unique=True)
	def save(self, *args, **kwargs): # On creation, display_name = intra_name
		if not self.display_name:
			self.display_name = self.intra_name
			while User.objects.filter(display_name=self.display_name).exists():
				if self.intra_name[-1].isdigit():
					digit = int(self.intra_name[-1])
					self.display_name = self.intra_name[:-1] + str(digit + 1)
				else:
					self.display_name = self.intra_name + str(0)
		super().save(*args, **kwargs)

	avatar = models.FileField(
		blank=True,
		null=True,
		default='/static/pong/img/default_avatar.svg',
		validators=[
			FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg']),
			file_size_validator
		])

	session_key = models.CharField(blank=True, null=True, max_length=40)
	is_online = models.BooleanField(default=False)

	created_at = models.DateTimeField(default=timezone.now)
	updated_at = AutoDateTimeField(default=timezone.now)

	def __str__(self):
		return f"{self.id}"

# 1v1 Games Match History
class MatchHistory(models.Model):
	user = models.ForeignKey(User, related_name='matches', on_delete=models.CASCADE)

	user_display_name = models.CharField(max_length=150, default='You')

	user_score = models.IntegerField(default=0)

	opponent_display_name = models.CharField(max_length=150)
	opponent_score = models.IntegerField(default=0)

	finished_at = models.DateTimeField(default=timezone.now)

class Relationship(models.Model):
	user1 = models.ForeignKey(User, related_name='friendship_from_user1', on_delete=models.CASCADE, editable=False)
	user2 = models.ForeignKey(User, related_name='friendship_from_user2', on_delete=models.CASCADE, editable=False)

	user1_is_friendly = models.BooleanField(default=True)
	user2_is_friendly = models.BooleanField(default=False)

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['user1', 'user2'], name='unique_relationship')
		]
	def __str__(self):
		return f"{self.user1.display_name} - {self.user2.display_name}"
	def save(self, *args, **kwargs):
		if Relationship.objects.filter(user1=self.user2, user2=self.user1).exists():
			raise ValidationError('Relationship already exists')
		super().save(*args, **kwargs)
