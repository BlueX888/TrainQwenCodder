// 固定随机种子工具
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  between(min, max) {
    return min + this.next() * (max - min);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.isWin = false;
    this.totalItems = 8;
    this.aiSpeed = 80;
    this.rng = new SeededRandom(42);
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家（蓝色方块）
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建 AI（黄色方块）
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);
    
    // 创建可收集物品组
    this.items = this.physics.add.group();
    this.createItems();
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);
    
    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalItems}`, {
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
    }).setOrigin(0.5).setVisible(false);
    
    // 添加提示文本
    this.add.text(16, 50, '方向键移动 | 收集绿色圆点 | 躲避黄色 AI', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建 AI 纹理（黄色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xffff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();
    
    // 创建物品纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成 8 个物品位置
    const positions = [];
    const margin = 50;
    const maxAttempts = 100;
    
    for (let i = 0; i < this.totalItems; i++) {
      let attempts = 0;
      let x, y, valid;
      
      do {
        x = this.rng.between(margin, 800 - margin);
        y = this.rng.between(margin, 600 - margin);
        
        // 确保不与玩家和 AI 起始位置太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 100, 100);
        const distToAI = Phaser.Math.Distance.Between(x, y, 700, 500);
        
        // 确保物品之间有一定距离
        valid = distToPlayer > 80 && distToAI > 80;
        if (valid) {
          for (let pos of positions) {
            if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 60) {
              valid = false;
              break;
            }
          }
        }
        
        attempts++;
      } while (!valid && attempts < maxAttempts);
      
      positions.push({ x, y });
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }
  }

  collectItem(player, item) {
    if (this.gameOver) return;
    
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);
    
    // 检查是否获胜
    if (this.score >= this.totalItems) {
      this.gameOver = true;
      this.isWin = true;
      this.statusText.setText('胜利！').setVisible(true);
      this.statusText.setStyle({ fill: '#00ff00' });
      this.physics.pause();
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.isWin = false;
    this.statusText.setText('失败！').setVisible(true);
    this.statusText.setStyle({ fill: '#ff0000' });
    this.physics.pause();
  }

  update(time, delta) {
    if (this.gameOver) return;
    
    // 玩家移动控制
    const playerSpeed = 160;
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
    
    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }
    
    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
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

// 暴露验证接口
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    gameOver: scene.gameOver,
    isWin: scene.isWin,
    totalItems: scene.totalItems,
    aiSpeed: scene.aiSpeed
  };
};