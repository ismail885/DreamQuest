import type { Adventure, Branch, AdventureWithAuthor, AdventureListItem } from '@/types/adventure'
import type { Save, SaveWithDetails, UserSave } from '@/types/save'
import type { Character, CreateCharacterPayload } from '@/types/character'

describe('Types - Contrats de structure', () => {
  describe('Adventure', () => {
    it('devrait exposer les champs obligatoires (id, titre, auteur_id, date_creation, popularite)', () => {
      const adventure: Adventure = {
        id: 1,
        titre: 'Ma Super Aventure',
        description: 'Une aventure incroyable',
        auteur_id: 1,
        date_creation: '2026-01-01',
        popularite: 10,
        embranchement_initial_id: 1,
      }

      expect(adventure.id).toBe(1)
      expect(adventure.titre).toBe('Ma Super Aventure')
      expect(adventure.description).toBe('Une aventure incroyable')
      expect(adventure.auteur_id).toBe(1)
      expect(adventure.date_creation).toBe('2026-01-01')
      expect(adventure.popularite).toBe(10)
      expect(adventure.embranchement_initial_id).toBe(1)
    })

    it('devrait accepter des valeurs nulles pour les champs optionnels', () => {
      const adventure: Adventure = {
        id: 1,
        titre: 'Aventure minimale',
        description: null,
        auteur_id: null,
        date_creation: '2026-01-01',
        popularite: 0,
        embranchement_initial_id: null,
      }

      expect(adventure.description).toBeNull()
      expect(adventure.auteur_id).toBeNull()
      expect(adventure.embranchement_initial_id).toBeNull()
    })
  })

  describe('Branch', () => {
    it('devrait exposer les 2 choix et leurs liens', () => {
      const branch: Branch = {
        id: 1,
        texte: 'Vous trouvez une épée brillante.',
        choix1: 'Prendre l\'épée',
        choix1_lien: 2,
        choix1_consequences: null,
        choix2: 'Ignorer l\'épée',
        choix2_lien: 3,
        choix2_consequences: null,
        id_aventure: 1,
      }

      expect(branch.choix1).toBe('Prendre l\'épée')
      expect(branch.choix1_lien).toBe(2)
      expect(branch.choix2).toBe('Ignorer l\'épée')
      expect(branch.choix2_lien).toBe(3)
    })

    it('devrait représenter une fin de branche via choixX_lien null', () => {
      const endBranch: Branch = {
        id: 99,
        texte: 'Fin de l\'aventure.',
        choix1: 'Recommencer',
        choix1_lien: null,
        choix1_consequences: null,
        choix2: '',
        choix2_lien: null,
        choix2_consequences: null,
        id_aventure: 1,
      }

      expect(endBranch.choix1_lien).toBeNull()
      expect(endBranch.choix2_lien).toBeNull()
    })
  })

  describe('AdventureWithAuthor', () => {
    it('devrait étendre Adventure avec auteur_nom optionnel', () => {
      const adventureWithAuthor: AdventureWithAuthor = {
        id: 1,
        titre: 'Aventure avec auteur',
        description: 'Description',
        auteur_id: 1,
        date_creation: '2026-01-01',
        popularite: 5,
        embranchement_initial_id: 1,
        auteur_nom: 'Ismail',
      }

      expect(adventureWithAuthor.auteur_nom).toBe('Ismail')
      expect(adventureWithAuthor.popularite).toBe(5)
    })

    it('devrait permettre auteur_nom indéfini', () => {
      const adventure: AdventureWithAuthor = {
        id: 1,
        titre: 'Aventure',
        description: null,
        auteur_id: null,
        date_creation: '2026-01-01',
        popularite: 0,
        embranchement_initial_id: null,
      }

      expect(adventure.auteur_nom).toBeUndefined()
    })
  })

  describe('AdventureListItem', () => {
    it('devrait exposer id, titre, description, popularite et options', () => {
      const item: AdventureListItem = {
        id: 1,
        titre: 'Aventure',
        description: null,
        popularite: 10,
        difficulte: 'normal',
        duree: 'moyenne',
        genre: 'fantasy',
      }

      expect(item.difficulte).toBe('normal')
      expect(item.duree).toBe('moyenne')
      expect(item.genre).toBe('fantasy')
    })
  })

  describe('Save', () => {
    it('devrait exposer les champs d\'une sauvegarde de base', () => {
      const save: Save = {
        id: 1,
        id_utilisateur: 1,
        id_aventure: 1,
        id_personnage: 1,
        id_embranchement_actuel: 5,
        progression: 50,
        date_sauvegarde: '2026-03-29T10:00:00Z',
      }

      expect(save.id).toBe(1)
      expect(save.progression).toBe(50)
      expect(save.id_embranchement_actuel).toBe(5)
    })
  })

  describe('SaveWithDetails', () => {
    it('devrait étendre Save avec aventure_titre et personnage_nom optionnels', () => {
      const save: SaveWithDetails = {
        id: 1,
        id_utilisateur: 1,
        id_aventure: 1,
        id_personnage: 1,
        id_embranchement_actuel: 5,
        progression: 50,
        date_sauvegarde: '2026-03-29T10:00:00Z',
        aventure_titre: 'La Quête du Dragon',
        personnage_nom: 'MonHéros',
      }

      expect(save.aventure_titre).toBe('La Quête du Dragon')
      expect(save.personnage_nom).toBe('MonHéros')
    })
  })

  describe('UserSave', () => {
    it('devrait inclure status completed/in-progress', () => {
      const inProgress: UserSave = {
        id: 1,
        id_utilisateur: 1,
        id_aventure: 1,
        id_personnage: 1,
        id_embranchement_actuel: 5,
        progression: 50,
        date_sauvegarde: '2026-03-29T10:00:00Z',
        aventure_titre: 'Aventure',
        status: 'in-progress',
      }

      const completed: UserSave = { ...inProgress, status: 'completed', progression: 100 }

      expect(inProgress.status).toBe('in-progress')
      expect(completed.status).toBe('completed')
    })
  })

  describe('Character', () => {
    it('devrait exposer les attributs principaux d\'un personnage', () => {
      const character: Character = {
        id: 1,
        nom_personnage: 'Héros',
        classe: 'Guerrier',
        niveau: 1,
        points_vie: 170,
        points_vie_max: 170,
        stats: { force: 8, agility: 5, magie: 3, endurance: 7 },
        id_utilisateur: 1,
        date_creation: '2026-03-29T10:00:00Z',
        experience: 0,
      }

      expect(character.nom_personnage).toBe('Héros')
      expect(character.classe).toBe('Guerrier')
      expect(character.niveau).toBe(1)
      expect(character.stats.endurance).toBe(7)
    })
  })

  describe('CreateCharacterPayload', () => {
    it('devrait exposer nom, classe et id_utilisateur', () => {
      const payload: CreateCharacterPayload = {
        nom_personnage: 'Merlin',
        classe: 'Mage',
        id_utilisateur: 42,
      }

      expect(payload.classe).toBe('Mage')
      expect(payload.id_utilisateur).toBe(42)
    })
  })
})
