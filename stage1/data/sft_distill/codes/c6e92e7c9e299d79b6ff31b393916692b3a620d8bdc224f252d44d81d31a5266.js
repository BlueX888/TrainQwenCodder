class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成AI纹理（青色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('ai', 40, 40);
    aiGraphics.destroy();

    // 生成物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 15 + Math.cos(angle) * 15;
      const y = 15 + Math.sin(angle) * 15;
      if (i === 0) {
        itemGraphics.moveTo(x, y);
      } else {
        itemGraphics.lineTo(x, y);
      }
      const innerAngle = (i * 144 - 90 + 72) * Math.PI / 180;
      const innerX = 15 + Math.cos(innerAngle) * 6;
      const innerY = 15 + Math.sin(innerAngle) * 6;
      itemGraphics.lineTo(innerX, innerY);
    }
    itemGraphics.closePath();
    itemGraphics.fillPath();
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI角色
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现）
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    for (let i = 0; i < 3; i++) {
      const x = 100 + random() * 600;
      const y = 100 + random() * 400;
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Items: 0/3', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);

    // AI速度常量
    this.aiSpeed = 360;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const playerSpeed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 归一化对角线移动速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // AI追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Items: ' + this.score + '/3');

    if (this.score >= 3) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.physics.pause();
    this.statusText.setText('YOU WIN!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.physics.pause();
    this.statusText.setText('GAME OVER!');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);
  }

  // 创建可重现的随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);