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


class Guest(models.Model):
	"""
	Represents a guest player in the Pong game.

	Attributes:
		id (UUIDField): The unique identifier for the guest player.
		display_name (CharField): The name displayed for the guest player.

	Methods:
		__str__(): Returns a string representation of the guest player.

	"""

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	display_name = models.CharField(max_length=100)

	def __str__(self):
		return f"{self.id}"
	

# Tournament model
class Tournament(models.Model):
	"""
	Model to represent a tournament in the application.

	Attributes:
		id (UUIDField): The unique identifier for the tournament.
		created_by (ForeignKey): The user who created the tournament.
		created_at (DateTimeField): The datetime when the tournament was created.
		status (CharField): The status of the tournament (open, closed, finished).
		winner (CharField): The winner of the tournament.
		match_count (IntegerField): The number of matches in the tournament.
		current_match (String) : "$Player1 vs $Player2" of the current match in the tournament.
		registered_users (ManyToManyField): The users registered for the tournament with a valid account.
	"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	created_by = models.ForeignKey(User, related_name='created_tournaments', on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=50, default='open')
	winner = models.CharField(max_length=50, blank=True)
	player_count = models.IntegerField(default=0)
	current_match = models.IntegerField()
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


class Match(models.Model):
	"""
	Represents a match in the Pong game.

	Attributes:
		MATCH_TYPE_CHOICES (list): Choices for the match type.
		MATCH_DIFFICULTY_CHOICES (list): Choices for the match difficulty.
		MATCH_STATUS_CHOICES (list): Choices for the match status.
		id (UUIDField): The unique identifier for the match.
		tournament (ForeignKey): The tournament the match belongs to (nullable).
		player1_user (ForeignKey): The first player as a registered user (nullable).
		player1_guest (ForeignKey): The first player as a guest (nullable).
		player2_user (ForeignKey): The second player as a registered user (nullable).
		player2_guest (ForeignKey): The second player as a guest (nullable).
		score_player1 (IntegerField): The score of the first player.
		score_player2 (IntegerField): The score of the second player.
		timestamp (DateTimeField): The timestamp when the match was created.
		status (CharField): The status of the match.
		difficulty (CharField): The difficulty level of the match.
		walkover (BooleanField): Indicates if the match was a walkover.

	Methods:
		__str__(): Returns a string representation of the match.
		get_player1_display(): Returns the display name of the first player.
		get_player2_display(): Returns the display name of the second player.
	"""

	MATCH_TYPE_CHOICES = [
		('local', 'Local'),
		('tournament', 'Tournament'),
	]
	MATCH_DIFFICULTY_CHOICES = [
		('slow', 'Slow'),
		('normal', 'Normal'),
		('fast', 'Fast'),
	]
	MATCH_STATUS_CHOICES = [
		('pending', 'Pending'),
		('finished', 'Finished'),
		('wo', 'Walkover'),
	]

	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	tournament = models.ForeignKey(Tournament, null=True, blank=True, related_name='matches', on_delete=models.SET_NULL)
	player1_user = models.ForeignKey(User, null=True, blank=True, related_name='matches_as_player1', on_delete=models.SET_NULL)
	player1_guest = models.ForeignKey(Guest, null=True, blank=True, related_name='matches_as_player1', on_delete=models.SET_NULL)
	player2_user = models.ForeignKey(User, null=True, blank=True, related_name='matches_as_player2', on_delete=models.SET_NULL)
	player2_guest = models.ForeignKey(Guest, null=True, blank=True, related_name='matches_as_player2', on_delete=models.SET_NULL)
	score_player1 = models.IntegerField()
	score_player2 = models.IntegerField()
	timestamp = models.DateTimeField(auto_now_add=True)
	status = models.CharField(max_length=20, choices=MATCH_STATUS_CHOICES, default='pending')
	difficulty = models.CharField(max_length=10, choices=MATCH_DIFFICULTY_CHOICES, default='normal')
	walkover = models.BooleanField(default=False)

	def __str__(self):
		return f"Match {self.id} - {self.get_player1_display()} vs {self.get_player2_display()}"

	def get_player1_display(self):
		if self.player1_user:
			return self.player1_user.display_name
		elif self.player1_guest:
			return self.player1_guest.display_name
		return 'Unknown'

	def get_player2_display(self):
		if self.player2_user:
			return self.player2_user.display_name
		elif self.player2_guest:
			return self.player2_guest.display_name
		return 'Unknown'


class TournamentMatch(models.Model):
	"""
	Model to store the matches of a tournament.

	Attributes:
		tournament (ForeignKey): The tournament associated with the match.
		match (ForeignKey): The match in the tournament.
		position (IntegerField): The position of the match in the tournament.

	Usage:
		Use this model to store the matches of a tournament in your Django application.
	"""

	tournament = models.ForeignKey(Tournament, related_name='tournament_matches', on_delete=models.CASCADE)
	match = models.ForeignKey(Match, related_name='tournament_match', on_delete=models.CASCADE)
	position = models.IntegerField()
	player1_display_name = models.CharField(max_length=150, default='Player 1')
	player2_display_name = models.CharField(max_length=150, default='Player 2')
	
	class Meta:
		unique_together = ('tournament', 'position')
	
	def __str__(self):
		return f"Tournament {self.tournament.id}'s match {self.position} - {self.match.id}"

	def get_tournament_match(self, position):
		"""
		Returns the match at the given position in the tournament.

		Args:
			position (int): The position of the match in the tournament.

		Returns:
			TournamentMatch: The match at the given position.

		Usage:
			Use this method to get the match at a specific position in the tournament.
		"""
		return self.tournament.tournament_matches.get(position=position).match


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
	sent_when_blocked = models.BooleanField(default=False)
	timestamp = models.DateTimeField(blank=True, null=True)
	last_read = models.DateTimeField(blank=True, null=True)
	
	def __str__(self):
		return f"{self.sender} -> {self.receiver}: {self.content[:20]}"

	def save(self, *args, **kwargs):
		"""
		Overrides the save method to update the timestamp before saving.
		
		Usage:
			This method is automatically called by Django before saving the model instance.
			It updates the timestamp to the current datetime value before saving.
		"""
		if not self.timestamp:
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