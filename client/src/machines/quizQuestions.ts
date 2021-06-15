import { AttributionProps } from "../components/attribution"

export interface Answer {
    text: string
    point: string
}

export interface Question {
    title: string
    image: string
    attribution?: AttributionProps
    answers: Array<Answer>
}

export interface Result {
    text: string
    image: string
    attribution?: AttributionProps
}

export const questions : Array<Question> = [
    {
        'title': "You are playing your arch-rival in Quidditch. You see a rogue Bludger headed for the other team's Chaser. Do you:",
        'image': '/patronus-quiz/Quidditch_pitch.jpg',
        'attribution': {
            'name': 'Quidditch pitch.jpg',
            'url': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Quidditch_pitch.jpg',
            'author': {
                'name': 'Dinosaur918',
            },
            'license': {
                'name': 'CC-BY-SA 4.0',
                'url': 'https://creativecommons.org/licenses/by-sa/4.0/?ref=ccsearch&atype=html'
            }
        },
        'answers': [
            {
                'text': "Silently cheer your good luck.",
                'point': 'cat'
            },
            {
                'text': "Scream at the Chaser to look out.",
                'point': 'swan'
            },
            {
                'text': "Smack the Bludger out of the way.",
                'point': 'stag'
            },
            {
                'text': "Go about your own business.",
                'point': 'otter'
            },
            {
                'text': "Tell the nearest member of the other team.",
                'point': 'dog'
            }
        ]
    },
    {
        'title': "At an invitation-only dinner with your favorite professor, you are served a pudding that you absolutely can't stand. Do you:",
        'image': '/patronus-quiz/pudding.jpg',
        'answers': [
            {
                'text': "Eat it anyway.",
                'point': 'dog',
            },
            {
                'text': "Try to use your napkin to hide some.",
                'point': 'otter'
            },
            {
                'text': "Claim to be full.",
                'point': 'cat'
            },
            {
                'text': `Say "I'm sorry, I really don't like this pudding."`,
                'point': 'stag'
            },
            {
                'text': "Make an excuse to leave early.",
                'point': 'swan'
            }
        ]
    },
    {
        'title': "It's after curfew, but you really want to get some treats from the Hogwarts kitchen. Do you:",
        'image': '/patronus-quiz/hungry.jpg',
        'answers': [
            {
                'text': "Go to bed hungry.",
                'point': 'dog'
            },
            {
                'text': "Call Dobby to you and ask him to get them.",
                'point': 'swan'
            },
            {
                'text': "Steal some snacks from your roommate's locker.",
                'point': 'cat'
            },
            {
                'text': "Use the Marauder's Map and your Invisibility Cloak to get to the kitchen.",
                'point': 'stag'
            },
            {
                'text': "Sneak out of the common room and search for the kitchen.",
                'point': 'otter'
            }
        ]
    },
    {
        'title': "A classmate of yours is in need of new robes. They are broke and too proud to ask to borrow money. Do you:",
        'image': '/patronus-quiz/robes.jpg',
        'answers': [
            {
                'text': "Get them new robes and have them delivered by Owl Post.",
                'point': 'stag'
            },
            {
                'text': "Give them a set of yours that you don't use.",
                'point': 'cat'
            },
            {
                'text': "Patch up their old robes.",
                'point': 'swan'
            },
            {
                'text': "Tease them about their robes' condition.",
                'point': 'otter'
            },
            {
                'text': "Accidentally light their robes on fire in Potions so they'll have to get new ones.",
                'point': 'dog'
            }
        ]
    },
    {
        'title': "You missed the Hogwarts Express! What mode of transportation would you try next to get to school?",
        'image': '/patronus-quiz/flying-car.jpg',
        'answers': [
            {
                'text': "Broomstick",
                'point': 'swan'
            },
            {
                'text': "Magical Car",
                'point': 'dog'
            },
            {
                'text': "Knight Bus",
                'point': 'cat'
            },
            {
                'text': "Thestral",
                'point': 'otter'
            },
            {
                'text': "Dragon",
                'point': 'stag'
            }
        ]
    },
    {
        'title': "You have the chance to take any one candy from Honeydukes that you want. Which would you choose?",
        'image': '/patronus-quiz/sweets.jpg',
        'answers': [
            {
                'text': "Acid Pops",
                'point': 'cat'
            },
            {
                'text': "Peppermint Toads",
                'point': 'stag'
            },
            {
                'text': "Chocolate Frogs",
                'point': 'dog'
            },
            {
                'text': "Fizzing Whizzbees",
                'point': 'swan'
            },
            {
                'text': "Jelly Slugs",
                'point': 'otter'
            }
        ]
    }
];

export const results : Map<string, Result> = new Map([
    ['dog', {
        'text': "You are loyal above all else. You are protective, yet loving. You will go out of your way to help others.",
        'image': '/patronus-quiz/dog.jpg'
    }],
    ['stag', {
        'text': "You are confident and a leader. You handle change with grace and swiftness. You can be gentle but vigilant.",
        'image': '/patronus-quiz/stag.jpg',
        'attribution': {
            'name': 'Red deer stag.jpg',
            'url': 'https://commons.wikimedia.org/wiki/File:Red_deer_stag.jpg',
            'author': {
                'name': 'Mehmet Karatay',
                'url': 'https://commons.wikimedia.org/wiki/User:Mehmet_Karatay'
            },
            'license': {
                'name': 'CC-BY-SA 3.0',
                'url': 'https://creativecommons.org/licenses/by-sa/3.0/deed.en'
            },
            "modifications": "Cropped from original"
        }
    }],
    ['swan', {
        'text': "You are intelligent and graceful. You appreciate peaceful times, but can be fierce in defending yourself and loved ones. You appreciate beauty, art, and culture.",
        'image': '/patronus-quiz/swan.jpg',
        'attribution': {
            'name': 'Mute swan (20608).jpg',
            'url': 'https://commons.wikimedia.org/wiki/File:Mute_swan_(20608).jpg',
            'author': {
                'name': 'Rhododendrites',
                'url': 'https://commons.wikimedia.org/wiki/User:Rhododendrites'
            },
            'license': {
                'name': 'CC-BY-SA 4.0',
                'url': 'https://creativecommons.org/licenses/by-sa/4.0/deed.en'
            },
            "modifications": "Cropped from original"
        }
    }],
    ['otter', {
        'text': "You are playful and fun. You enjoy making others laugh. You are great at finding things you need and using the tools you find around you in creative ways.",
        'image': '/patronus-quiz/otter.jpg',
        'attribution': {
            'name': 'Sea-otter-morro-bay 13.jpg',
            'url': 'https://commons.wikimedia.org/wiki/File:Sea-otter-morro-bay_13.jpg',
            'author': {
                'name': 'Mike Baird',
                'url': 'https://www.flickr.com/people/72825507@N00'
            },
            'license': {
                'name': 'CC-BY 2.0',
                'url': 'https://creativecommons.org/licenses/by/2.0/deed.en'
            },
            "modifications": "Cropped from original"
        }
    }],
    ['cat', {
        'text': "You are independent and patient. You have an adventurous spirit and enjoy discovering new areas. You are also very relaxed and chill.",
        'image': '/patronus-quiz/cat.jpg',
        'attribution': {
            'name': 'Cat November 2010-1a',
            'url': 'https://commons.wikimedia.org/wiki/File:Cat_November_2010-1a.jpg',
            'author': {
                'name': 'Alvesgaspar',
                'url': 'https://commons.wikimedia.org/wiki/User:Alvesgaspar'
            },
            'license': {
                'name': 'CC-BY-SA 3.0',
                'url': 'https://creativecommons.org/licenses/by-sa/3.0/deed.en'
            },
            "modifications": "Cropped from original"
        }
    }]
]);
