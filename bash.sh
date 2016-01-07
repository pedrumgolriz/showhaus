ED='\033[0;31m'
bold=$(tput bold)
normal=$(tput sgr0)
NC='\033[0m' # No Color

# update
echo "${RED}-->${NC} ${bold}Pulling Changes...${normal}"
git pull

# start sass
echo "\n ${RED}-->${NC} ${bold}Starting Sass Compiler...${normal}"
cd app/_css && sass --watch tapedeck.scss:tapedeck.css &

# localhost
echo "\n ${RED}-->${NC} ${bold}Initializing localhost...${normal}"
grunt clean build serve &

# refresh main.css
echo " \n ${RED}-->${NC} ${bold}Refreshing main.css...${normal}"
rm -f app/_css/main.css
