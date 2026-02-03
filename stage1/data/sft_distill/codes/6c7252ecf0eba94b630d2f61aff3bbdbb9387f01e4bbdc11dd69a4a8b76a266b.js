class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalItems = 20;
  }

  preload() {
    // 不需要加载外部资源，使用程序化生成纹理
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 随机生成20个收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, '已收集: 0/20', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加说明文本
    this.add.text(16, 50, '使用方向键移动收集圆形', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
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
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 更新收集计数
    this.collectedCount++;

    // 更新分数文本
    this.scoreText.setText(`已收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否完成收集
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  winGame() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 显示通关文本
    this.winText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('游戏通关！收集数:', this.collectedCount);
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

// 可验证的状态信号（用于测试）
game.events.on('ready', () => {
  console.log('游戏已启动');
  console.log('初始收集数:', game.scene.scenes[0].collectedCount);
  console.log('总目标数:', game.scene.scenes[0].totalItems);
});