import uuid # Required for unique user id
from django.conf import settings # Required for MAX_UPLOAD_SIZE
from django.db import models # Required for models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser # Required for custom user model
from django.core.validators import FileExtensionValidator # Required for file extension validation
from django.core.exceptions import ValidationError # Required for raising validation errors
from django.utils import timezone # Required for timezone.now()


# Custom Validators

def file_size_validator(file):
	"""
	Validates the size of a file.

	This function checks if the size of the given file exceeds the maximum upload size defined in the settings.
	If the file size exceeds the limit, a ValidationError is raised.

	Parameters:
	- file: The file to be validated.

	Raises:
	- ValidationError: If the file size exceeds the maximum upload size.

	Returns:
	- None
	"""
	if file.size > settings.MAX_UPLOAD_SIZE:
		raise ValidationError('File size exceeds the 5 MiB limit.')


# Custom Fields

class AutoDateTimeField(models.DateTimeField):
	"""
	A custom DateTimeField that automatically sets the current datetime value before saving.

	Inherits from models.DateTimeField.

	Attributes:
		None

	Methods:
		pre_save(model_instance, add): Returns the current datetime value to be saved.

	Usage:
		Use this field in your Django model to automatically set the current datetime value
		before saving the model instance.
	"""

	def pre_save(self, model_instance, add):
		"""
		Returns the current datetime value to be saved.

		Args:
			model_instance (Model): The model instance being saved.
			add (bool): Indicates whether the model instance is being added or updated.

		Returns:
			datetime: The current datetime value.

		Usage:
			This method is automatically called by Django before saving the model instance.
			It returns the current datetime value to be saved.
		"""
		return timezone.now()


# Custom User Model

class IntraUserManager(BaseUserManager):
	"""
	Custom manager for the IntraUser model.
	"""

	def create_user(self, intra_name):
		"""
		Create a new user with the given Intra name.

		Args:
			intra_name (str): The Intra name of the user.

		Returns:
			User: The created user object.
		"""
		user = self.model(
			intra_name=intra_name,
		)
		user.is_superuser = False
		user.save(using=self._db)
		return user

	def create_superuser(self, intra_name):
		"""
		Create a new superuser with the given Intra name.

		Args:
			intra_name (str): The Intra name of the superuser.

		Returns:
			User: The created superuser object.
		"""
		user = self.model(
			intra_name=intra_name,
		)
		user.is_superuser = True
		user.save(using=self._db)
		return user

class User(AbstractBaseUser):
	"""
	Custom user model for the application.

	Inherits from AbstractBaseUser.

	Attributes:
		id (UUIDField): The unique identifier for the user.
		intra_name (CharField): The user's intra name.
		display_name (CharField): The user's display name.
		avatar (FileField): The user's avatar file.
		session_key (CharField): The user's session key.
		is_online (BooleanField): Indicates if the user is currently online.
		created_at (DateTimeField): The datetime when the user was created.
		updated_at (AutoDateTimeField): The datetime when the user was last updated.
		email (EmailField): The user's email address.
		password (CharField): The user's password.

	Methods:
		save(*args, **kwargs): Overrides the save method to set the display_name before saving.

	Usage:
		Use this model to represent users in your Django application.
	"""

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	intra_name = models.CharField(max_length=150, unique=True)

	objects = IntraUserManager()
	USERNAME_FIELD = "intra_name"

	display_name = models.CharField(max_length=150, unique=True)

	avatar = models.FileField(
		blank=True,
		null=True,
		default='/static/pong/img/default_avatar.svg',
		validators=[
			FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg']),
			file_size_validator
		]
	)

	session_key = models.CharField(blank=True, null=True, max_length=40)
	is_online = models.BooleanField(default=False)

	created_at = models.DateTimeField(default=timezone.now)
	updated_at = AutoDateTimeField(default=timezone.now)

	email = models.EmailField(unique=True)
	password = models.CharField(max_length=128)

	def __str__(self):
		"""
		Returns a string representation of the object.
		
		The string representation is the ID of the object.
		"""
		return f"{self.id}"

	def save(self, *args, **kwargs):
		"""
		Overrides the save method to set the display_name before saving.

		Usage:
			This method is automatically called by Django before saving the model instance.
			It sets the display_name if it is not already set.
		"""
		if not self.display_name:
			self.display_name = self.intra_name
			while User.objects.filter(display_name=self.display_name).exists():
				if self.intra_name[-1].isdigit():
					digit = int(self.intra_name[-1])
					self.display_name = self.intra_name[:-1] + str(digit + 1)
				else:
					self.display_name = self.intra_name + str(0)
		super().save(*args, **kwargs)
	
		return self

# Match History

class MatchHistory(models.Model):
	"""
	Model to store the match history of 1v1 games.

	Attributes:
		user (ForeignKey): The user associated with the match.
		user_display_name (CharField): The display name of the user.
		user_score (IntegerField): The score of the user.
		opponent_display_name (CharField): The display name of the opponent.
		opponent_score (IntegerField): The score of the opponent.
		finished_at (DateTimeField): The datetime when the match was finished.

	Usage:
		Use this model to store the match history of 1v1 games in your Django application.
	"""

	user = models.ForeignKey(User, related_name='matches', on_delete=models.CASCADE)
	user_display_name = models.CharField(max_length=150, default='You')
	user_score = models.IntegerField(default=0)
	opponent_display_name = models.CharField(max_length=150)
	opponent_score = models.IntegerField(default=0)
	finished_at = models.DateTimeField(default=timezone.now)


# Relationship Model

class Relationship(models.Model):
	"""
	Model to represent the relationship between two users.

	Attributes:
		user1 (ForeignKey): The first user in the relationship.
		user2 (ForeignKey): The second user in the relationship.
		user1_is_friendly (BooleanField): Indicates if user1 is friendly towards user2.
		user2_is_friendly (BooleanField): Indicates if user2 is friendly towards user1.

	Usage:
		Use this model to represent relationships between users in your Django application.
	"""

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
		"""
		Overrides the save method to check for existing relationship.

		Raises:
			ValidationError: If the relationship already exists.

		Usage:
			This method is automatically called by Django before saving the model instance.
			It checks if the reverse relationship already exists and raises a ValidationError if it does.
		"""
		if Relationship.objects.filter(user1=self.user2, user2=self.user1).exists():
			raise ValidationError('Relationship already exists')
		super().save(*args, **kwargs)