# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: cado-car <cado-car@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/06/20 18:52:02 by cado-car          #+#    #+#              #
#    Updated: 2024/06/21 22:50:25 by cado-car         ###   ########.fr        #
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
	@$(COMPOSE_CMD) -f $(COMPOSE_PATH) up -d --build
	@echo "${GREEN}Docker Compose is up and running${NC}"

stop:
	@echo "${YELLOW}Stopping Docker Compose${NC}"
	@$(COMPOSE_CMD) -f $(COMPOSE_PATH) stop
	@echo "${GREEN}Docker Compose has stopped${NC}"

restart: stop up

down:
	@echo "${YELLOW}Removing Docker Compose containers${NC}"
	@$(COMPOSE_CMD) -f $(COMPOSE_PATH) down --rmi all --remove-orphans -v
	@echo "${GREEN}Docker Compose containers have been removed\n${NC}"

clean: down
	@echo "${YELLOW}Deep cleaning the container's past files and repositories${NC}"
	@rm -f $(SRC_DIR)/app/logs/*.log
	@rm -rf $(SRC_DIR)/app/pong/migrations/0*
	@sudo rm -rf  $(SRC_DIR)/app/postgres
	@echo "${GREEN}All Docker past files and repositories have been cleaned${NC}"

fclean: clean
	@echo "${YELLOW}Cleaning Docker components${NC}"
	@if [ -z "$$(docker ps -qa)" ]; then \
		echo "${RED}No other docker containers to clean${NC}"; \
	else \
		echo "${RED}Cleaning docker containers${NC}"; \
		docker stop $$(docker ps -qa); \
		docker rm $$(docker ps -qa); \
	fi
	@if [ -z "$$(docker images -qa)" ]; then \
		echo "${RED}No other docker images to clean${NC}"; \
	else \
		docker rmi -f $$(docker images -qa); \
	fi
	@if [ -z "$$(docker volume ls -q)" ]; then \
		echo "${RED}No other docker volumes to clean${NC}"; \
	else \
		docker volume rm $$(docker volume ls -q); \
	fi
	@if [ -z "$$(docker network ls -q)" ]; then \
		echo "${RED}No other docker networks to clean${NC}"; \
	else \
		for network in $(shell docker network ls -q); do \
			network_name=$$(docker network inspect $$network | grep Name | sed 's/.*: *"\(.*\)",*/\1/'); \
			if [ "$$network_name" = "bridge" ] || [ "$$network_name" = "host" ] || [ "$$network_name" = "none" ]; then \
				continue; \
			fi; \
			docker network rm $$network; \
		done; \
	fi
	@echo "${GREEN}Docker components have been cleaned${NC}\n"

re: clean all
	

# ---------------------------------------------------------------------------- #
# COLORS --------------------------------------------------------------------- #
# ---------------------------------------------------------------------------- #

RED		= \033[0;31m
GREEN	= \033[0;32m
YELLOW	= \033[0;33m
NC		= \033[0m