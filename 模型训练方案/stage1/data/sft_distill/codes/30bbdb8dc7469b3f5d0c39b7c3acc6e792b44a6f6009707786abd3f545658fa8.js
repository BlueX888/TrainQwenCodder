// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  collected: 0,
  total: 3,
  gameComplete: false,
  playerPosition: { x: 0, y: 0 }
};

class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collected = 0;
    this.totalDiamonds = 3;
    this.diamonds = null;
    this.player = null;
    this.cursors = null;
    this.winText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建菱形纹理（金色菱形）
    const diamondGraphics = this.add.graphics();
    diamondGraphics.fillStyle(0xffd700, 1);
    diamondGraphics.beginPath();
    diamondGraphics.moveTo(15, 0);
    diamondGraphics.lineTo(30, 15);
    diamondGraphics.lineTo(15, 30);
    diamondGraphics.lineTo(0, 15);
    diamondGraphics.closePath();
    diamondGraphics.fillPath();
    diamondGraphics.generateTexture('diamond', 30, 30);
    diamondGraphics.destroy();

    // 创建玩家精灵
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建收集计数文本
    this.collectionText = this.add.text(16, 16, `已收集: ${this.collected}/${this.totalDiamonds}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关', {
      fontSize: '64px',
      fill: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加操作提示
    this.add.text(16, 560, '使用方向键移动收集菱形', {
      fontSize: '18px',
      fill: '#cccccc'
    });

    console.log(JSON.stringify({
      event: 'game_start',
      diamonds: this.totalDiamonds,
      timestamp: Date.now()
    }));
  }

  update() {
    if (this.collected >= this.totalDiamonds) {
      // 游戏已完成，不再处理移动
      return;
    }

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

    // 更新全局信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  collectDiamond(player, diamond) {
    // 销毁收集到的菱形
    diamond.destroy();
    
    // 增加收集计数
    this.collected++;

    // 更新显示文本
    this.collectionText.setText(`已收集: ${this.collected}/${this.totalDiamonds}`);

    // 更新全局信号
    window.__signals__.collected = this.collected;

    console.log(JSON.stringify({
      event: 'diamond_collected',
      collected: this.collected,
      remaining: this.totalDiamonds - this.collected,
      timestamp: Date.now()
    }));

    // 检查是否收集完成
    if (this.collected >= this.totalDiamonds) {
      this.completeGame();
    }
  }

  completeGame() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示通关文本
    this.winText.setVisible(true);

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 更新全局信号
    window.__signals__.gameComplete = true;

    console.log(JSON.stringify({
      event: 'game_complete',
      collected: this.collected,
      timestamp: Date.now()
    }));
  }

  generateRandomPositions(count) {
    const positions = [];
    const minDistance = 100; // 最小间距
    const padding = 50; // 边界留白

    for (let i = 0; i < count; i++) {
      let validPosition = false;
      let attempts = 0;
      let pos;

      while (!validPosition && attempts < 100) {
        pos = {
          x: Phaser.Math.Between(padding, 800 - padding),
          y: Phaser.Math.Between(padding, 600 - padding)
        };

        // 检查与玩家初始位置的距离
        const distToPlayer = Phaser.Math.Distance.Between(pos.x, pos.y, 400, 300);
        if (distToPlayer < minDistance) {
          attempts++;
          continue;
        }

        // 检查与其他菱形的距离
        validPosition = true;
        for (let existingPos of positions) {
          const dist = Phaser.Math.Distance.Between(pos.x, pos.y, existingPos.x, existingPos.y);
          if (dist < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      positions.push(pos);
    }

    return positions;
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);