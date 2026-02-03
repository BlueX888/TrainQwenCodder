class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameState = 'playing'; // playing, win, lose
    this.totalItems = 20;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成纹理
    this.createTextures();

    // 创建玩家 (蓝色方块)
    this.player = this.physics.add.sprite(100, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建AI (白色方块)
    this.ai = this.physics.add.sprite(700, 500, 'aiTex');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();
    this.createItems();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  createTextures() {
    // 玩家纹理 (蓝色)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // AI纹理 (白色)
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xffffff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('aiTex', 32, 32);
    aiGraphics.destroy();

    // 收集物纹理 (黄色圆形)
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('itemTex', 16, 16);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成随机位置
    const positions = [];
    const seed = 12345;
    let random = seed;
    
    // 简单的伪随机数生成器
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    // 生成20个不重叠的位置
    for (let i = 0; i < this.totalItems; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        valid = true;
        x = 50 + seededRandom() * 700;
        y = 50 + seededRandom() * 500;
        
        // 检查与玩家和AI的距离
        if (Phaser.Math.Distance.Between(x, y, 100, 100) < 80 ||
            Phaser.Math.Distance.Between(x, y, 700, 500) < 80) {
          valid = false;
        }
        
        // 检查与其他物品的距离
        for (let pos of positions) {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 40) {
            valid = false;
            break;
          }
        }
        
        attempts++;
        if (attempts > 100) break; // 防止无限循环
      } while (!valid);
      
      positions.push({ x, y });
      const item = this.items.create(x, y, 'itemTex');
      item.setCircle(8);
    }
  }

  collectItem(player, item) {
    if (this.gameState !== 'playing') return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.totalItems}`);

    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (this.gameState !== 'playing') return;
    this.loseGame();
  }

  winGame() {
    this.gameState = 'win';
    this.statusText.setText('YOU WIN!\nCollected all items!');
    this.statusText.setVisible(true);
    this.physics.pause();
  }

  loseGame() {
    this.gameState = 'lose';
    this.statusText.setText('GAME OVER!\nCaught by AI!');
    this.statusText.setVisible(true);
    this.physics.pause();
  }

  update(time, delta) {
    if (this.gameState !== 'playing') return;

    // 玩家移动控制
    const playerSpeed = 200;
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

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.707,
        this.player.body.velocity.y * 0.707
      );
    }

    // AI追踪玩家，速度固定为300
    this.physics.moveToObject(this.ai, this.player, 300);
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

new Phaser.Game(config);