class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.totalItems = 8;
  }

  preload() {
    // 创建纯色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 玩家纹理 - 蓝色方块
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    // AI纹理 - 黄色圆形
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('ai', 32, 32);
    graphics.clear();
    
    // 物品纹理 - 绿色小圆点
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('item', 16, 16);
    graphics.clear();
    
    graphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);
    
    // 创建AI
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);
    this.ai.body.setSize(28, 28);
    
    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现）
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < this.totalItems; i++) {
      let x, y;
      let validPosition = false;
      
      // 确保物品不会生成在玩家或AI附近
      while (!validPosition) {
        x = 50 + random() * 700;
        y = 50 + random() * 500;
        
        const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        const distToAI = Phaser.Math.Distance.Between(x, y, this.ai.x, this.ai.y);
        
        if (distToPlayer > 100 && distToAI > 100) {
          validPosition = true;
        }
      }
      
      const item = this.items.create(x, y, 'item');
      item.body.setSize(14, 14);
    }
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);
    
    // UI文本
    this.scoreText = this.add.text(16, 16, `物品: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
    
    // 提示文本
    this.add.text(16, 50, '方向键移动 | 收集绿点 | 躲避黄色AI', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }
    
    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // AI追踪逻辑
    const aiSpeed = 80;
    const angle = Phaser.Math.Angle.Between(
      this.ai.x, 
      this.ai.y, 
      this.player.x, 
      this.player.y
    );
    
    this.physics.velocityFromRotation(angle, aiSpeed, this.ai.body.velocity);
    
    // 让AI面向玩家
    this.ai.rotation = angle;
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`物品: ${this.score}/${this.totalItems}`);
    
    // 检查胜利条件
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    
    this.statusText.setText('胜利！');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);
    
    console.log('Game Won! Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    
    this.statusText.setText('失败！被AI抓住了');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);
    
    console.log('Game Over! Score:', this.score);
  }

  // 简单的伪随机数生成器（保证可重现性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
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

new Phaser.Game(config);