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
        'title': "You are being followed by a hooded stranger, you:",
        'image': '/patronus-quiz/hoodie.jpg',
        'attribution': {
            'name': '194/365 Hoodie',
            'url': 'https://www.flickr.com/photos/7232686@N03/3967113235',
            'author': {
                'name': 'mek22',
                'url': 'https://www.flickr.com/photos/7232686@N03'
            },
            'license': {
                'name': 'CC-BY-NC-SA 2.0',
                'url': 'https://creativecommons.org/licenses/by-nc-sa/2.0/?ref=ccsearch&atype=html'
            },
            "modifications": "Cropped from original"
        },
        'answers': [
            {
                'text': "Run",
                'point': 'dog'
            },
            {
                'text': `Yell at the figure, "Take off, dude"`,
                'point': 'swan'
            },
            {
                'text': "Tell the figure your best joke",
                'point': 'otter'
            },
            {
                'text': "Ignore the figure and go about your business",
                'point': 'cat'
            },
            {
                'text': `Confront the figure -- "Are you following me?"`,
                'point': 'stag'
            }
        ]
    },
    {
        'title': "Your favourite activity over the holiday is:",
        'image': '/patronus-quiz/holidays.jpg',
        'attribution': {
            'name': 'Summer',
            'url': 'https://www.flickr.com/photos/52645838@N00/35593986991',
            'author': {
                'name': 'simplethrill',
                'url': 'https://www.flickr.com/photos/52645838@N00'
            },
            'license': {
                'name': 'CC-BY-NC-ND 2.0',
                'url': 'https://creativecommons.org/licenses/by-nc-nd/2.0/?ref=ccsearch&atype=html'
            },
            "modifications": "Cropped from original"
        },
        'answers': [
            {
                'text': "Writing in a journal",
                'point': 'swan',
            },
            {
                'text': "Rounding up Death Eaters",
                'point': 'dog'
            },
            {
                'text': "Searching for dragon eggs",
                'point': 'stag'
            },
            {
                'text': "Sleeping",
                'point': 'cat'
            },
            {
                'text': "Partying",
                'point': 'otter'
            }
        ]
    },
    {
        'title': "Your favourite subject in school is:",
        'image': '/patronus-quiz/castle.jpg',
        'attribution': {
            'name': 'Castle',
            'url': 'https://www.flickr.com/photos/26234859@N07/5982384567',
            'author': {
                'name': 'milan.boers',
                'url': 'https://www.flickr.com/photos/26234859@N07'
            },
            'license': {
                'name': 'CC-BY 2.0',
                'url': 'https://creativecommons.org/licenses/by/2.0/?ref=ccsearch&atype=html'
            },
            "modifications": "Cropped from original"
        },
        'answers': [
            {
                'text': "Divination",
                'point': 'cat'
            },
            {
                'text': "Potions",
                'point': 'otter'
            },
            {
                'text': "Transfiguration",
                'point': 'swan'
            },
            {
                'text': "Care of Magical Creatures",
                'point': 'dog'
            },
            {
                'text': "Defense Against the Dark Arts",
                'point': 'stag'
            }
        ]
    },
    {
        'title': "Your ideal career is:",
        'image': '/patronus-quiz/career.jpg',
        'attribution': {
            'name': 'Career',
            'url': 'https://www.flickr.com/photos/144008357@N08/45854121975',
            'author': {
                'name': 'Got Credit',
                'url': 'https://www.flickr.com/photos/144008357@N08'
            },
            'license': {
                'name': 'CC-BY 2.0',
                'url': 'https://creativecommons.org/licenses/by/2.0/?ref=ccsearch&atype=html'
            },
            "modifications": "Cropped from original"
        },
        'answers': [
            {
                'text': "Auror",
                'point': 'cat'
            },
            {
                'text': "Professor",
                'point': 'stag'
            },
            {
                'text': "Dragon keeper",
                'point': 'otter'
            },
            {
                'text': "Professional Quidditch player",
                'point': 'dog'
            },
            {
                'text': "Minister of Magic",
                'point': 'swan'
            }
        ]
    },
    {
        'title': "Who do you most idolize?",
        'image': '/patronus-quiz/idol.jpg',
        'answers': [
            {
                'text': "Professor Dumbledore",
                'point': 'cat'
            },
            {
                'text': "Professor Trelawney",
                'point': 'otter'
            },
            {
                'text': "Professor Snape",
                'point': 'swan'
            },
            {
                'text': "Dobby",
                'point': 'dog'
            },
            {
                'text': "Lily Potter",
                'point': 'stag'
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
