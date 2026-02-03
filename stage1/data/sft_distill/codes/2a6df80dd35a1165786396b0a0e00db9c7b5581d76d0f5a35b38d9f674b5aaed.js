class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameState = 'playing'; // 可验证状态: 'playing', 'win', 'lose'
    this.score = 0; // 可验证变量
    this.totalItems = 12;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 设置固定随机种子以保证确定性
    Phaser.Math.RND.sow(['phaser3-ai-chase']);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);

    // 创建 AI
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 生成 12 个物品，确保不与玩家和 AI 初始位置重叠
    for (let i = 0; i < this.totalItems; i++) {
      let x, y, tooClose;
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
        
        // 检查是否距离玩家或 AI 太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        const distToAI = Phaser.Math.Distance.Between(x, y, this.ai.x, this.ai.y);
        tooClose = distToPlayer < 100 || distToAI < 100;
      } while (tooClose);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 添加碰撞检测：AI 碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, `Score: 0/${this.totalItems}`, {
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

    // AI 速度常量
    this.aiSpeed = 80;
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // AI 追踪玩家逻辑
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.totalItems}`);

    // 检查是否获胜
    if (this.score >= this.totalItems) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    // 被 AI 碰到，游戏失败
    this.loseGame();
  }

  winGame() {
    this.gameState = 'win';
    this.physics.pause();
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    console.log('Game Over: WIN');
  }

  loseGame() {
    this.gameState = 'lose';
    this.physics.pause();
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    console.log('Game Over: LOSE');
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

// 暴露全局访问接口用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    state: scene.gameState,
    score: scene.score,
    totalItems: scene.totalItems,
    playerPos: { x: scene.player.x, y: scene.player.y },
    aiPos: { x: scene.ai.x, y: scene.ai.y }
  };
};