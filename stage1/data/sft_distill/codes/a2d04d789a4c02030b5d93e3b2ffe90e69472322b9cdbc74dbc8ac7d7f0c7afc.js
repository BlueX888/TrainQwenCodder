// 固定随机种子函数
class SeededRandom {
  constructor(seed) {
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
    this.gameWon = false;
    this.random = new SeededRandom(12345); // 固定种子保证确定性
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    
    // 创建 AI 角色
    this.ai = this.physics.add.sprite(100, 100, 'aiTex');
    this.ai.setCollideWorldBounds(true);
    
    // 创建可收集物品组
    this.items = this.physics.add.group();
    this.createItems();
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);
    
    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0/8', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建游戏状态文本（初始隐藏）
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();
    
    // 创建 AI 纹理（黄色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xffff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('aiTex', 32, 32);
    aiGraphics.destroy();
    
    // 创建物品纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('itemTex', 24, 24);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成 8 个物品
    const positions = [];
    
    // 生成不重叠的位置
    for (let i = 0; i < 8; i++) {
      let x, y, valid;
      let attempts = 0;
      
      do {
        valid = true;
        x = this.random.between(50, 750);
        y = this.random.between(50, 550);
        
        // 检查是否与玩家或 AI 初始位置太近
        if (Phaser.Math.Distance.Between(x, y, 400, 300) < 100 ||
            Phaser.Math.Distance.Between(x, y, 100, 100) < 100) {
          valid = false;
        }
        
        // 检查是否与其他物品太近
        for (let pos of positions) {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 50) {
            valid = false;
            break;
          }
        }
        
        attempts++;
        if (attempts > 100) break; // 防止无限循环
      } while (!valid);
      
      positions.push({ x, y });
      
      const item = this.items.create(x, y, 'itemTex');
      item.setCollideWorldBounds(true);
    }
  }

  collectItem(player, item) {
    if (this.gameOver) return;
    
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + '/8');
    
    // 检查是否获胜
    if (this.score >= 8) {
      this.gameWon = true;
      this.gameOver = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitAI(player, ai) {
    if (this.gameOver) return;
    
    this.gameOver = true;
    this.gameWon = false;
    this.endGame('GAME OVER!', '#ff0000');
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    // 显示游戏状态
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);
    
    // 添加重启提示
    const restartText = this.add.text(400, 360, 'Press SPACE to restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
    
    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;
    
    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
    
    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, 80);
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态验证变量（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}