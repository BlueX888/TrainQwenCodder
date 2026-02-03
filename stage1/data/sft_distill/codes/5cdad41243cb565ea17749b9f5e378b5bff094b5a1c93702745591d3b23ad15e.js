class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.score = 0;
    this.totalItems = 20;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocityDrag(500);
    this.player.setMaxVelocity(300);

    // 创建收集物组
    this.items = this.physics.add.group();
    
    // 随机生成 20 个收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
      item.body.setOffset(0, 0);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.totalItems}`, {
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(16, 50, '使用方向键移动', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  collectItem(player, item) {
    // 移除收集物
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.totalItems}`);

    // 检查是否完成
    if (this.score >= this.totalItems && !this.gameCompleted) {
      this.gameCompleted = true;
      this.winText.setVisible(true);
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      
      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        alpha: { from: 1, to: 0.3 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return; // 游戏完成后停止更新
    }

    // 键盘控制
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