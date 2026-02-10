class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalItems = 12;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建椭圆收集物纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillEllipse(15, 10, 30, 20);
    itemGraphics.lineStyle(2, 0xff8800, 1);
    itemGraphics.strokeEllipse(15, 10, 30, 20);
    itemGraphics.generateTexture('item', 30, 20);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 随机生成12个椭圆
    const positions = this.generateRandomPositions(this.totalItems);
    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setImmovable(true);
      // 添加轻微的浮动动画
      this.tweens.add({
        targets: item,
        y: item.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文字
    this.scoreText = this.add.text(16, 16, `收集: 0/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);

    // 创建通关文字（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加提示文字
    this.hintText = this.add.text(400, 550, '使用方向键移动，收集所有黄色椭圆', {
      fontSize: '18px',
      fill: '#cccccc'
    });
    this.hintText.setOrigin(0.5);
  }

  update() {
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
    // 收集物品
    item.destroy();
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 播放收集音效（使用缩放动画代替）
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });

    // 检查是否通关
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  winGame() {
    // 显示通关文字
    this.winText.setVisible(true);
    this.hintText.setVisible(false);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.cursors = null;

    // 添加闪烁动画
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加庆祝效果
    this.createCelebrationEffect();
  }

  createCelebrationEffect() {
    // 创建随机飘落的彩色粒子效果
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(-100, 0);
      const color = Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]);

      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(0, 0, 5);
      graphics.x = x;
      graphics.y = y;

      this.tweens.add({
        targets: graphics,
        y: 700,
        x: x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Linear',
        onComplete: () => graphics.destroy()
      });
    }
  }

  generateRandomPositions(count) {
    const positions = [];
    const minDistance = 80; // 最小间距
    const margin = 50; // 边缘留白

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      while (!validPosition && attempts < 100) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);

        // 检查是否与已有位置距离足够远
        validPosition = true;
        for (let pos of positions) {
          const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        // 避免与玩家初始位置重叠
        if (Phaser.Math.Distance.Between(x, y, 400, 300) < 100) {
          validPosition = false;
        }

        attempts++;
      }

      positions.push({ x, y });
    }

    return positions;
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
  scene: CollectionGame
};

new Phaser.Game(config);