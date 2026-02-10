class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsPerLevel = 5;
    this.seed = 12345; // 固定种子保证确定性
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  create() {
    // 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 创建文本显示
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    
    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });
    
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);
    
    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    
    // 生成当前关卡的物品
    this.generateLevel();
  }

  createTextures() {
    // 创建玩家纹理（紫色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9932cc, 1); // 紫色
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1); // 黄色
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);
    
    // 重置随机种子（每关使用不同但确定的种子）
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed + this.level * 1000]);
    
    // 根据关卡增加物品数量
    const itemCount = this.itemsPerLevel + Math.floor((this.level - 1) / 2);
    
    // 生成物品
    for (let i = 0; i < itemCount; i++) {
      const x = this.rnd.between(50, 750);
      const y = this.rnd.between(50, 400);
      
      const item = this.items.create(x, y, 'item');
      item.body.setSize(24, 24);
      item.setData('value', 10 * this.level); // 关卡越高分数越高
    }
    
    // 更新显示
    this.levelText.setText(`Level: ${this.level}`);
    this.messageText.setText('');
  }

  collectItem(player, item) {
    // 增加分数
    const points = item.getData('value');
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 销毁物品
    item.destroy();
    
    // 检查是否收集完所有物品
    if (this.items.countActive() === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level >= 10) {
      // 游戏胜利
      this.messageText.setText('VICTORY!\nAll 10 Levels Complete!');
      this.player.setVelocity(0, 0);
      this.cursors = null; // 禁用输入
      
      // 输出最终状态用于验证
      console.log('Game Complete!');
      console.log('Final Level:', this.level);
      console.log('Final Score:', this.score);
    } else {
      // 进入下一关
      this.level++;
      this.messageText.setText(`Level ${this.level}!`);
      
      // 延迟后生成新关卡
      this.time.delayedCall(1500, () => {
        this.generateLevel();
      });
      
      // 重置玩家位置
      this.player.setPosition(400, 500);
      this.player.setVelocity(0, 0);
    }
  }

  update(time, delta) {
    if (!this.cursors) return; // 游戏结束后停止更新
    
    const speed = 200;
    
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 键盘控制
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
    
    // 对角线移动速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }
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

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    level: scene.level,
    score: scene.score,
    itemsRemaining: scene.items ? scene.items.countActive() : 0
  };
};