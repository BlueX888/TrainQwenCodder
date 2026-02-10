class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameOver = false;
    this.survivalTime = 0;
    this.health = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(200);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成10个敌人，随机位置
    for (let i = 0; i < 10; i++) {
      let x, y;
      // 确保敌人不会生成在玩家附近
      do {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
      } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 添加重启提示
    this.restartText = this.add.text(400, 360, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 添加R键重启
    this.input.keyboard.on('keydown-R', () => {
      if (this.gameOver) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

    // 玩家移动控制
    const acceleration = 300;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的角度
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 设置敌人速度（朝向玩家，速度120）
      this.physics.velocityFromRotation(angle, 120, enemy.body.velocity);
    });

    // 更新状态显示
    const seconds = Math.floor(this.survivalTime / 1000);
    this.statusText.setText(
      `Health: ${this.health}\n` +
      `Survival Time: ${seconds}s\n` +
      `Enemies: ${this.enemies.countActive()}`
    );
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.health = 0;

    // 停止玩家
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setTint(0xff0000);

    // 停止所有敌人
    this.enemies.children.entries.forEach(e => {
      e.setVelocity(0, 0);
    });

    // 显示游戏结束信息
    const seconds = Math.floor(this.survivalTime / 1000);
    this.gameOverText.setText('GAME OVER!');
    this.gameOverText.setVisible(true);
    
    this.restartText.setText(`You survived ${seconds} seconds!\nPress R to restart`);
    this.restartText.setVisible(true);

    // 输出状态信号到控制台
    console.log('=== GAME OVER ===');
    console.log('Health:', this.health);
    console.log('Survival Time:', seconds, 'seconds');
    console.log('Game Over:', this.gameOver);
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