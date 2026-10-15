# Formule 1

Suivez la saison de Formule 1 dans Gladys : le prochain Grand Prix avec toutes ses séances à votre heure
locale, les leaders du championnat, le dernier vainqueur et, si vous le souhaitez, votre pilote et votre
écurie favoris. Un widget de tableau de bord affiche le compte à rebours, le week-end et le classement ; des
déclencheurs de scène vous préviennent avant une séance et quand les résultats tombent ; des actions de
scène vous donnent des phrases prêtes à envoyer.

Les données viennent de [Jolpica-F1](https://github.com/jolpica/jolpica-f1), le successeur libre et gratuit
de l'API Ergast. Pas de compte, pas de clé. Vos retours sont les bienvenus sur le forum Gladys.

## Ce qu'il faut

- Gladys 5.1.0 ou plus récent.
- Un accès à Internet depuis Gladys : l'intégration lit `api.jolpi.ca`.

## Configuration

Après l'installation, enregistrez une fois la configuration, puis ouvrez l'onglet **Découverte** et ajoutez
l'appareil **Formule 1**. Le bouton **Vérifier** relit Jolpica-F1 et affiche la saison, le prochain Grand
Prix et vos favoris tels que l'intégration les a compris.

### Langue

La langue des noms des fonctionnalités, des noms des séances et des phrases des scènes (Gladys ne donne
pas à une intégration la langue de ses utilisateurs). Les noms des fonctionnalités sont fixés à l'ajout de
l'appareil : pour les changer, supprimez l'appareil et ajoutez-le de nouveau. Le widget suit la langue de
la personne qui le regarde. Les noms des Grands Prix, circuits, pilotes et écuries restent tels que
Jolpica-F1 les écrit, en anglais.

### Pilote et écurie favoris

Facultatifs. Le pilote : son code de trois lettres (`VER`), son numéro (`16`), son nom (`Hamilton`) ou son
nom complet. L'écurie : son nom (`Ferrari`, `Red Bull`, `McLaren`). Majuscules et accents n'importent pas.
Quand l'un est renseigné, l'appareil reçoit trois fonctionnalités de plus (position au championnat,
points, dernier résultat), et le widget une tuile avec la position. Un nom qui ne correspond à personne
dans la saison en cours est signalé dans l'état de connexion, et **Vérifier** liste les pilotes et les
écuries de la saison. Après avoir changé un favori, cliquez sur **Mettre à jour** sur l'appareil dans
l'onglet Découverte quand Gladys le propose.

## L'appareil Formule 1

| Fonctionnalité                    | Valeur                                                                 |
| --------------------------------- | ---------------------------------------------------------------------- |
| Prochain Grand Prix               | son nom ; « Saison … terminée » après la dernière course               |
| Circuit, Pays                     | où il a lieu                                                           |
| Départ de la course, des qualifs  | jour et heure, dans le fuseau horaire de Gladys                        |
| Départ du sprint                  | jour et heure, ou « Pas de sprint »                                    |
| Prochaine séance                  | la prochaine séance du week-end, ou la course « en cours »             |
| Jours avant la course             | 0 le jour de la course                                                 |
| Manche                            | la manche du prochain Grand Prix                                       |
| Week-end de course                | Allumé du jour des premiers essais au jour de la course                |
| Course aujourd'hui                | Allumé le jour de la course                                            |
| Leader pilotes / constructeurs    | nom et points                                                          |
| Dernier vainqueur, Dernier podium | de la dernière course dont les résultats sont publiés                  |
| Pilote favori : …                 | position, points, dernier Grand Prix (0 : non classé)                  |
| Écurie favorite : …               | position, points, meilleure voiture au dernier Grand Prix (0 : aucune) |

Un Grand Prix reste le « prochain » jusqu'à trois heures après son départ. Les valeurs sont rafraîchies
par l'intégration elle-même (Gladys n'interroge pas cet appareil), et republiées deux fois par jour.

## Widget de tableau de bord

Ajoutez le widget **Formule 1** à un tableau de bord. Il affiche le nom du prochain Grand Prix, le compte à
rebours jusqu'à la course (« 10 j 5 h », puis heures et minutes le jour de la course, puis « En cours »),
la manche, la position de vos favoris, les séances du week-end à votre heure locale (la prochaine mise en
avant), le top 5 du championnat pilotes ou constructeurs (un réglage du widget) et le podium de la dernière
course.

## Déclencheurs de scène

### Séance qui commence

Se déclenche avant une séance d'un week-end de Grand Prix. Choisissez les séances (essais libres 1 à 3,
qualifications sprint, sprint, qualifications, course ; vide : toutes) et quand : au départ, ou 5, 15,
30 minutes, 1 ou 2 heures avant. La scène peut lire le nom de la séance, le Grand Prix, le circuit, l'heure
de début, les minutes restantes et la manche.

### Course terminée

Se déclenche quand les résultats d'un Grand Prix sont publiés sur Jolpica-F1, en général quelques heures
après le drapeau à damier (l'intégration vérifie toutes les 10 minutes après la course). La scène peut lire
une phrase de résumé (« Max Verstappen (Red Bull) remporte le Singapore Grand Prix, devant … »), le Grand
Prix, le vainqueur et son écurie, le podium, la position de votre pilote favori et la meilleure position
de votre écurie favorite (0 : non classé ou non choisi).

## Actions de scène

- **Lire le prochain Grand Prix** : une phrase comme « Prochain Grand Prix : United States Grand Prix,
  manche 18, Circuit of the Americas, Austin (États-Unis). Course dimanche 25 octobre à 21:00, dans
  10 jours. », plus le nom, le départ de la course et les jours restants (-1 quand la saison est finie).
- **Lire le classement** : le haut du championnat pilotes ou constructeurs (1 à 10 places), en une phrase,
  plus le leader et ses points.

## Exemples de scènes

- **Ne jamais rater le départ** : déclencheur « Séance qui commence », séances Qualifications et Course,
  15 minutes avant → envoyer un message avec la Séance, le Grand Prix et l'Heure de début, et allumer la
  télé.
- **Bilan du dimanche soir** : déclencheur « Course terminée » → envoyer la phrase de résumé par message.
- **Briefing du lundi matin** : chaque lundi à 8 h → « Lire le prochain Grand Prix » et « Lire le
  classement » → envoyer les deux phrases.
- **Ambiance course** : déclencheur « Séance qui commence », Course, au départ → passer les lumières du
  salon en rouge.

## Dépannage

- **L'appareil n'affiche rien** : ajoutez-le depuis l'onglet Découverte, puis attendez une minute.
  Regardez l'état de connexion de l'intégration : il indique quand Jolpica-F1 est injoignable.
- **« Pilote favori introuvable »** : utilisez **Vérifier**, qui liste les pilotes et les écuries de la
  saison avec leurs codes.
- **Un déclencheur ne s'est pas lancé** : une séance dont l'heure n'est pas encore annoncée ne déclenche
  rien ; un redémarrage de Gladys ou de l'intégration de plus de 10 minutes perd les déclencheurs de ce
  moment-là.
- **Les résultats arrivent tard** : Jolpica-F1 est maintenu par des bénévoles ; les résultats sont en
  général publiés en quelques heures, parfois le lendemain. L'intégration continue de vérifier pendant
  48 heures après une course.

## Limites

- Pas de direct : Jolpica-F1 donne calendriers, résultats et classements, pas ce qui se passe pendant une
  séance. Drapeaux rouges et voitures de sécurité demanderaient des données en direct, qu'OpenF1 ne donne
  qu'aux utilisateurs payants pendant une séance : il n'y a pas de déclencheur pour eux.
- Les résultats des sprints ne sont pas suivis, seulement ceux des Grands Prix.
- Les lectures sont espacées pour respecter les limites de Jolpica-F1 (4 requêtes par seconde, 500 par
  heure) : le calendrier une fois par jour, résultats et classements toutes les 6 heures, et toutes les
  10 minutes après une course jusqu'à leur publication. Les réponses sont gardées en cache dans le dossier
  de données de l'intégration : l'appareil et le widget continuent de fonctionner quand l'API est en panne.
- Les noms (Grands Prix, circuits, pilotes, écuries) sont en anglais, tels que Jolpica-F1 les publie.

## Données et crédits

Calendrier, résultats et classements : [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (code sous
Apache 2.0, données selon les conditions du projet). Cette intégration n'est affiliée ni à la Formule 1, ni
à la FIA, ni à Jolpica-F1. Formula 1 et F1 sont des marques de Formula One Licensing B.V.
