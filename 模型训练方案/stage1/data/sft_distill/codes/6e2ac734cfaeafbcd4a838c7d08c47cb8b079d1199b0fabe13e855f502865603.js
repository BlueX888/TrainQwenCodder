class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0;
    this.totalDiamonds = 3;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      collectedCount: 0,
      totalDiamonds: 3,
      gameCompleted: false,
      playerPosition: { x: 0, y: 0 }
    };

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建菱形纹理（金色菱形）
    const diamondGraphics = this.add.graphics();
    diamondGraphics.fillStyle(0xf1c40f, 1);
    diamondGraphics.beginPath();
    diamondGraphics.moveTo(20, 0);
    diamondGraphics.lineTo(40, 20);
    diamondGraphics.lineTo(20, 40);
    diamondGraphics.lineTo(0, 20);
    diamondGraphics.closePath();
    diamondGraphics.fillPath();
    diamondGraphics.generateTexture('diamond', 40, 40);
    diamondGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建菱形组
    this.diamonds = this.physics.add.group();

    // 随机生成3个菱形
    const positions = this.generateRandomPositions(3);
    positions.forEach(pos => {
      const diamond = this.diamonds.create(pos.x, pos.y, 'diamond');
      diamond.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.diamonds,
      this.collectDiamond,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, `收集进度: ${this.collectedCount}/${this.totalDiamonds}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 创建控制说明
    this.add.text(16, 560, '使用方向键移动收集菱形', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 日志输出初始状态
    console.log(JSON.stringify({
      event: 'game_start',
      totalDiamonds: this.totalDiamonds,
      diamondPositions: positions
    }));
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

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  collectDiamond(player, diamond) {
    // 移除菱形
    diamond.destroy();

    // 增加收集计数
    this.collectedCount++;

    // 更新UI
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalDiamonds}`);

    // 更新信号
    window.__signals__.collectedCount = this.collectedCount;

    // 日志输出收集事件
    console.log(JSON.stringify({
      event: 'diamond_collected',
      collectedCount: this.collectedCount,
      totalDiamonds: this.totalDiamonds,
      position: { x: Math.round(diamond.x), y: Math.round(diamond.y) }
    }));

    // 检查是否通关
    if (this.collectedCount >= this.totalDiamonds) {
      this.winGame();
    }
  }

  winGame() {
    // 显示通关文本
    this.winText.setVisible(true);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 禁用输入
    this.cursors.left.enabled = false;
    this.cursors.right.enabled = false;
    this.cursors.up.enabled = false;
    this.cursors.down.enabled = false;

    // 更新信号
    window.__signals__.gameCompleted = true;

    // 日志输出通关事件
    console.log(JSON.stringify({
      event: 'game_completed',
      collectedCount: this.collectedCount,
      totalDiamonds: this.totalDiamonds
    }));

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  generateRandomPositions(count) {
    const positions = [];
    const margin = 50;
    const minDistance = 100;

    for (let i = 0; i < count; i++) {
      let valid = false;
      let x, y;

      while (!valid) {
        x = Phaser.Math.Between(margin, 800 - margin);
        y = Phaser.Math.Between(margin, 600 - margin);

        // 检查是否与玩家初始位置太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        if (distToPlayer < minDistance) {
          continue;
        }

        // 检查是否与其他菱形太近
        valid = true;
        for (let pos of positions) {
          const dist = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (dist < minDistance) {
            valid = false;
            break;
          }
        }
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
  backgroundColor: '#2c3e50',
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