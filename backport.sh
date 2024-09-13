git reset HEAD~1
rm ./backport.sh
git cherry-pick 54ffe92a6b6eba8311ec6aba0505bfdc3bf3cdd4
echo 'Resolve conflicts and force push this branch'
