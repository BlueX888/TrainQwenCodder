class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300);
    this.player.setDrag(800);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成10个敌人，随机位置
    for (let i = 0; i < 10; i++) {
      let x, y;
      // 确保敌人不在玩家附近生成
      do {
        x = Phaser.Math.Between(50, width - 50);
        y = Phaser.Math.Between(50, height - 50);
      } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示存活时间
    this.timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏状态文本
    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 提示文本
    this.add.text(16, height - 40, 'Use Arrow Keys or WASD to move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 重置计时器
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Survival Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const acceleration = 600;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 240);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setTint(0xff0000);

    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });

    // 显示游戏结束信息
    this.statusText.setText(`GAME OVER!\nSurvived: ${this.survivalTime.toFixed(1)}s`);
    this.statusText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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

new Phaser.Game(config);