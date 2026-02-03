class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800);
    this.player.setMaxVelocity(300);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在场景边缘随机生成 8 个敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 50 },
      { x: 400, y: 550 },
      { x: 50, y: 300 },
      { x: 750, y: 300 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 添加玩家与敌人的碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建 UI 文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.instructionText = this.add.text(400, 16, 'Use Arrow Keys or WASD to move', {
      fontSize: '18px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 0);

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 重置游戏状态
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime += delta;
    this.timeText.setText(`Time: ${(this.survivalTime / 1000).toFixed(1)}s`);

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

    // 让所有敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 200);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;
    
    // 停止所有物理对象
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束信息
    this.gameOverText.setText(`GAME OVER!\nSurvived: ${(this.survivalTime / 1000).toFixed(1)}s`);
    this.gameOverText.setVisible(true);

    // 玩家变红
    this.player.setTint(0xff0000);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });

    // 输出验证信号
    console.log('Game Over - Survival Time:', (this.survivalTime / 1000).toFixed(1), 'seconds');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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