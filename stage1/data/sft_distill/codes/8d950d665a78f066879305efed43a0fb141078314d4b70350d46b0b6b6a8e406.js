class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalBoxes = 12;
    this.gameCompleted = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建方块纹理
    const boxGraphics = this.add.graphics();
    boxGraphics.fillStyle(0xffff00, 1);
    boxGraphics.fillRect(0, 0, 24, 24);
    boxGraphics.generateTexture('box', 24, 24);
    boxGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(300);

    // 创建方块组
    this.boxes = this.physics.add.group();
    
    // 随机生成12个方块
    for (let i = 0; i < this.totalBoxes; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const box = this.boxes.create(x, y, 'box');
      box.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.boxes,
      this.collectBox,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalBoxes}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关!', {
      fontSize: '48px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加提示文本
    this.add.text(400, 580, '使用方向键移动收集黄色方块', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  collectBox(player, box) {
    // 移除被收集的方块
    box.destroy();
    
    // 增加收集计数
    this.collectedCount++;
    
    // 更新UI
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalBoxes}`);

    // 检查是否完成
    if (this.collectedCount >= this.totalBoxes) {
      this.completeGame();
    }
  }

  completeGame() {
    this.gameCompleted = true;
    
    // 显示通关文本
    this.winText.setVisible(true);
    
    // 停止玩家移动
    this.player.setVelocity(0);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出完成信号到控制台
    console.log('游戏完成! 收集数量:', this.collectedCount);
  }

  update(time, delta) {
    // 游戏完成后不再处理输入
    if (this.gameCompleted) {
      return;
    }

    // 重置加速度
    this.player.setAcceleration(0);

    // 处理键盘输入
    const speed = 600;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(speed);
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
  scene: CollectionGame
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    collectedCount: scene.collectedCount,
    totalBoxes: scene.totalBoxes,
    gameCompleted: scene.gameCompleted
  };
};