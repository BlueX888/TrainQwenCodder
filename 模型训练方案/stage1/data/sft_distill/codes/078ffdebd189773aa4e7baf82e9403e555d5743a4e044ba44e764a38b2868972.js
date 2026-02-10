class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.totalScore = 0;
    this.itemsToCollect = 0;
    this.collectedItems = 0;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 重置当前关卡收集计数
    this.collectedItems = 0;
    
    // 计算当前关卡需要收集的物品数量（关卡越高物品越多）
    this.itemsToCollect = 3 + this.level;
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(300);
    
    // 创建收集物品组
    this.items = this.physics.add.group();
    this.spawnItems();
    
    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 创建 UI 文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.scoreText = this.add.text(16, 50, `Score: ${this.totalScore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.itemsText = this.add.text(16, 84, `Items: ${this.collectedItems}/${this.itemsToCollect}`, {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 通关提示文本（初始隐藏）
    this.winText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  spawnItems() {
    // 使用固定种子生成确定性随机位置
    const seed = this.level * 1000;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < this.itemsToCollect; i++) {
      // 生成随机位置，避免边缘和玩家初始位置
      let x, y;
      do {
        x = 100 + random() * 600;
        y = 100 + random() * 400;
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 100);
      
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.body.setAllowGravity(false);
      
      // 添加轻微漂浮动画
      this.tweens.add({
        targets: item,
        y: item.y + 10,
        duration: 1000 + random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // 简单的种子随机数生成器
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.collectedItems++;
    this.totalScore += 10 * this.level; // 关卡越高分数越高
    
    // 更新 UI
    this.scoreText.setText(`Score: ${this.totalScore}`);
    this.itemsText.setText(`Items: ${this.collectedItems}/${this.itemsToCollect}`);
    
    // 添加收集特效
    const flash = this.add.circle(item.x, item.y, 20, 0xffff00, 0.8);
    this.tweens.add({
      targets: flash,
      radius: 40,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });
    
    // 检查是否收集完所有物品
    if (this.collectedItems >= this.itemsToCollect) {
      this.levelComplete();
    }
  }

  levelComplete() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();
    
    if (this.level >= 10) {
      // 通关所有关卡
      this.winText.setText(`VICTORY!\nFinal Score: ${this.totalScore}`);
      this.winText.setVisible(true);
      
      // 3秒后重置游戏
      this.time.delayedCall(3000, () => {
        this.level = 1;
        this.totalScore = 0;
        this.scene.restart();
      });
    } else {
      // 进入下一关
      this.winText.setText(`Level ${this.level} Complete!\nNext Level...`);
      this.winText.setVisible(true);
      
      this.level++;
      
      // 1.5秒后重新开始场景
      this.time.delayedCall(1500, () => {
        this.scene.restart();
      });
    }
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return; // 关卡完成时不处理输入
    }
    
    // 玩家移动控制
    const acceleration = 500;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}