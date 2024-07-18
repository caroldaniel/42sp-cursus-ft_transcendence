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

	def create_user(self, username):
		"""
		Create a new user with the given Intra name.

		Args:
			intra_name (str): The Intra name of the user.

		Returns:
			User: The created user object.
		"""

		# Check if user already exists
		try:
			user = self.get(username=username)
			return None
		except self.model.DoesNotExist:
			user = self.model(
				username=username
			)

		user.is_superuser = False
		user.save(using=self._db)
		return user


	def create_superuser(self, username):
		"""
		Create a new superuser with the given Intra name.

		Args:
			intra_name (str): The Intra name of the superuser.

		Returns:
			User: The created superuser object.
		"""
		
		# Check if user already exists
		try:
			user = self.get(username=username)
			return None
		except self.model.DoesNotExist:
			user = self.model(
				username=username
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
		is_intra_user (BooleanField): Indicates if the user is an 42Intra user.
		game_token (CharField): The user's game token.

	Methods:
		save(*args, **kwargs): Overrides the save method to set the display_name before saving.

	Usage:
		Use this model to represent users in your Django application.
	"""

	# Custom manager
	objects = IntraUserManager()
	USERNAME_FIELD = 'username'

	# Required fields
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	username = models.CharField(max_length=150, unique=True)
	display_name = models.CharField(max_length=150)
	email = models.EmailField(unique=True)
	password = models.CharField(max_length=128, blank=True)
	first_name = models.CharField(max_length=30, blank=True)
	last_name = models.CharField(max_length=150, blank=True)
	game_token = models.CharField(max_length=5, blank=True)
	is_intra_user = models.BooleanField(default=False)

	avatar = models.FileField(
		blank=True,
		null=True,
		default='default.svg',
		validators=[
			FileExtensionValidator(allowed_extensions=['svg', 'png', 'jpg', 'jpeg']),
			file_size_validator
		]
	)

	session_key = models.CharField(blank=True, null=True, max_length=40)
	is_online = models.BooleanField(default=False)

	created_at = models.DateTimeField(default=timezone.now)
	updated_at = AutoDateTimeField(default=timezone.now)

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
			self.display_name = self.username

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


# Chat message model
class Message(models.Model):
	"""
	Model to represent a chat message between two users.
	
	Attributes:
		sender (ForeignKey): The user who sent the message.
		receiver (ForeignKey): The user who received the message.
		content (TextField): The content of the message.
		timestamp (DateTimeField): The datetime when the message was sent.
	"""
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
	receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.sender} -> {self.receiver}: {self.content[:20]}"

	def save(self, *args, **kwargs):
		"""
		Overrides the save method to update the timestamp before saving.
		
		Usage:
			This method is automatically called by Django before saving the model instance.
			It updates the timestamp to the current datetime value before saving.
		"""
		self.timestamp = timezone.now()
		super().save(*args, **kwargs)

# Block list model
class BlockList(models.Model):
	"""
	Model to represent a block list between two users.
	
	Attributes:
		blocker (ForeignKey): The user who blocked the other user.
		blocked (ForeignKey): The user who was blocked.
		created_at (DateTimeField): The datetime when the block was created
	"""
	blocker = models.ForeignKey(User, related_name='blocks_from', on_delete=models.CASCADE)
	blocked = models.ForeignKey(User, related_name='blocks_to', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)


	def __str__(self):
		return f"{self.blocker} -> {self.blocked}"

	def save(self, *args, **kwargs):
		"""
		Overrides the save method to check for existing block.
		
		Raises:
			ValidationError: If the block already exists.
		
		Usage:
			This method is automatically called by Django before saving the model instance.
			It checks if the block already exists and raises a ValidationError if it does.
		"""
		if BlockList.objects.filter(blocker=self.blocker, blocked=self.blocked).exists():
			raise ValidationError('Block already exists')
		super().save(*args, **kwargs)

# Tournament model
class Tournament(models.Model):
	"""
	Model to represent a tournament in the application.

	Attributes:
		id (UUIDField): The unique identifier for the tournament.
		created_by (ForeignKey): The user who created the tournament.
		created_at (DateTimeField): The datetime when the tournament was created.
		ended_at (DateTimeField): The datetime when the tournament ended.
		winner (ForeignKey): The winner of the tournament.
		match_count (IntegerField): The number of matches in the tournament.
		actual_match (String) : "$Player1 vs $Player2" of the current match in the tournament.
		registered_users (ManyToManyField): The users registered for the tournament with a valid account.
	"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	created_by = models.ForeignKey(User, related_name='created_tournaments', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)
	ended_at = models.DateTimeField(null=True, blank=True)
	winner = models.ForeignKey(User, related_name='won_tournaments', on_delete=models.CASCADE, null=True, blank=True)
	match_count = models.IntegerField(default=0)
	actual_match = models.CharField(max_length=50, blank=True)
	registered_users = models.ManyToManyField(User, related_name='registered_tournaments', blank=True)

	def __str__(self):
		return self.id

	def save(self, *args, **kwargs):
		"""
		Overrides the save method to update the timestamp before saving.
		
		Usage:
			This method is automatically called by Django before saving the model instance.
			It updates the timestamp to the current datetime value before saving.
		"""
		self.created_at = timezone.now()
		super().save(*args, **kwargs)