# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: cado-car <cado-car@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/20 18:52:02 by cado-car          #+#    #+#              #
#    Updated: 2024/06/20 20:51:19 by cado-car         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

NAME			= ft_transcendence
USER			= $(shell echo $$USER)

SRC_DIR			= ./src
LOGS_DIR		= $(SRC_DIR)/logs

# Compose configuration
COMPOSE_PATH	= $(SRC_DIR)/docker-compose.yml
COMPOSE_CMD		= docker-compose
ifeq (, $(shell which $(COMPOSE_CMD)))
	COMPOSE_CMD	= docker compose
endif


# ---------------------------------------------------------------------------- #
# RULES ---------------------------------------------------------------------- #
# ---------------------------------------------------------------------------- #

.PHONY: all up stop restart down clean fclean re

all: up
	@echo "\n"
	@echo "${GREEN}#-------------------------------------------------------#"
	@echo "${GREEN}#\tWelcome to the ${NAME} project!\t#"
	@echo "${GREEN}#\t\t\t\t\t\t\t#"
	@echo "#${YELLOW}\tA pong game developed by:\t\t\t$(GREEN)#"
	@echo "#${YELLOW}\t\t- cado-car\t\t\t\t$(GREEN)#"
	@echo "#${YELLOW}\t\t- dofranci\t\t\t\t$(GREEN)#"
	@echo "#${YELLOW}\t\t- jlucas-s\t\t\t\t$(GREEN)#"
	@echo "#${YELLOW}\t\t- rarobert\t\t\t\t$(GREEN)#"
	@echo "${GREEN}#-------------------------------------------------------#${NC}"
	@echo "\n"

up:
	@echo "${YELLOW}Building Docker Compose${NC}"
	$(COMPOSE_CMD) -f $(COMPOSE_PATH) up -d --build
	@echo "${GREEN}Docker Compose is up and running${NC}"

stop:
	@echo "${YELLOW}Stopping Docker Compose${NC}"
	$(COMPOSE_CMD) -f $(COMPOSE_PATH) stop
	@echo "${GREEN}Docker Compose has stopped${NC}"

restart: stop up

down:
	@echo "${YELLOW}Removing Docker Compose containers${NC}"
	$(COMPOSE_CMD) -f $(COMPOSE_PATH) down --rmi all --remove-orphans -v
	@echo "${GREEN}Docker Compose containers have been removed${NC}"

clean: down
	@echo "${YELLOW}Cleaning Docker${NC}"
	docker stop $(shell docker ps -qa); docker rm $(shell docker ps -qa); docker rmi -f $(shell docker images -qa); docker volume rm $(shell docker volume ls -q); docker network rm $(shell docker network ls -q) 2>/dev/null
	@echo "${GREEN}Docker containers have been cleaned${NC}"

fclean:
	@echo "${YELLOW}Deep cleaning the container's past files${NC}"
	rm -f $(SRC_DIR)/app/logs/*.log
	rm -rf $(SRC_DIR)/app/pong/migrations/0*
	sudo rm -rf  $(SRC_DIR)/app/postgres
	@echo "${GREEN}Docker past files have been removed${NC}"

re: clean fclean all
	

# ---------------------------------------------------------------------------- #
# COLORS --------------------------------------------------------------------- #
# ---------------------------------------------------------------------------- #

RED		= \033[0;31m
GREEN	= \033[0;32m
YELLOW	= \033[0;33m
NC		= \033[0m