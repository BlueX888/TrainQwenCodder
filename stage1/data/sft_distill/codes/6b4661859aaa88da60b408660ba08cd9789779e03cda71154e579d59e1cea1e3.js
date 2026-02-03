class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalItems = 12;
    this.gameCompleted = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建椭圆纹理
    const ellipseGraphics = this.add.graphics();
    ellipseGraphics.fillStyle(0xffff00, 1);
    ellipseGraphics.fillEllipse(20, 15, 40, 30);
    ellipseGraphics.lineStyle(2, 0xff9900, 1);
    ellipseGraphics.strokeEllipse(20, 15, 40, 30);
    ellipseGraphics.generateTexture('ellipse', 40, 30);
    ellipseGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建椭圆收集物组
    this.collectibles = this.physics.add.group();

    // 随机分布 12 个椭圆
    const positions = this.generateRandomPositions(this.totalItems);
    positions.forEach(pos => {
      const ellipse = this.collectibles.create(pos.x, pos.y, 'ellipse');
      ellipse.setCollideWorldBounds(true);
      // 添加轻微的浮动效果
      this.tweens.add({
        targets: ellipse,
        y: ellipse.y + 10,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集进度: 0/${this.totalItems}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '64px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 创建操作提示
    this.add.text(16, 560, '使用方向键移动玩家收集椭圆', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    if (this.gameCompleted) {
      // 游戏完成后停止玩家移动
      this.player.setVelocity(0);
      return;
    }

    // 玩家移动控制
    const speed = 300;

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

  // 生成随机位置（避免重叠和边界）
  generateRandomPositions(count) {
    const positions = [];
    const margin = 50;
    const minDistance = 80;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      while (!validPosition && attempts < 100) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);

        // 检查与玩家初始位置的距离
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distToPlayer < 100) {
          attempts++;
          continue;
        }

        // 检查与其他椭圆的距离
        validPosition = true;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      positions.push({ x, y });
    }

    return positions;
  }

  // 收集物品回调
  collectItem(player, ellipse) {
    // 销毁椭圆
    ellipse.destroy();

    // 增加计数
    this.collectedCount++;

    // 更新文本
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalItems}`);

    // 播放收集音效（使用视觉反馈代替）
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.3);
    flash.fillCircle(ellipse.x, ellipse.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems) {
      this.completeGame();
    }
  }

  // 完成游戏
  completeGame() {
    this.gameCompleted = true;

    // 显示通关文本
    this.winText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 添加烟花效果
    this.time.addEvent({
      delay: 200,
      callback: this.createFirework,
      callbackScope: this,
      loop: true
    });

    console.log('游戏完成！收集数量:', this.collectedCount);
  }

  // 创建烟花效果
  createFirework() {
    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(100, 500);
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    const color = Phaser.Utils.Array.GetRandom(colors);

    for (let i = 0; i < 8; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 4);
      particle.x = x;
      particle.y = y;

      const angle = (Math.PI * 2 / 8) * i;
      const speed = 100;

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
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

// 启动游戏
const game = new Phaser.Game(config);