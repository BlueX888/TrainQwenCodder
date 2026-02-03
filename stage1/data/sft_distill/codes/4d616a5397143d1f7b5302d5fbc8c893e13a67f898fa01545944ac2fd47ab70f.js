class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
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
  }

  create() {
    // 添加背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800);
    this.player.setMaxVelocity(250);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成15个敌人，随机分布在场景边缘
    for (let i = 0; i < 15; i++) {
      let x, y;
      const side = Phaser.Math.Between(0, 3);
      
      switch(side) {
        case 0: // 上边
          x = Phaser.Math.Between(50, 750);
          y = 50;
          break;
        case 1: // 右边
          x = 750;
          y = Phaser.Math.Between(50, 550);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(50, 750);
          y = 550;
          break;
        case 3: // 左边
          x = 50;
          y = Phaser.Math.Between(50, 550);
          break;
      }
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 50, 'Use Arrow Keys or WASD to dodge enemies!', {
      fontSize: '18px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s`);

    // 玩家移动控制
    const speed = 300;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(speed);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(speed);
    } else {
      this.player.setAccelerationY(0);
    }

    // 每个敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 160);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.body.setVelocity(0, 0);
    });

    // 停止玩家
    this.player.body.setVelocity(0, 0);
    this.player.body.setAcceleration(0, 0);

    // 玩家变红
    this.player.setTint(0xff0000);

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const finalTimeText = this.add.text(400, 380, `You survived for ${this.survivalTime.toFixed(2)} seconds!`, {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 450, 'Refresh to play again', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 输出到控制台供验证
    console.log('Game Over! Survival Time:', this.survivalTime.toFixed(2), 'seconds');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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