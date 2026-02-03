class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
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
    this.player.setMaxVelocity(300);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成10个敌人，随机分布在边缘
    for (let i = 0; i < 10; i++) {
      let x, y;
      const edge = Phaser.Math.Between(0, 3);
      
      switch(edge) {
        case 0: // 上边
          x = Phaser.Math.Between(0, 800);
          y = 0;
          break;
        case 1: // 右边
          x = 800;
          y = Phaser.Math.Between(0, 600);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(0, 800);
          y = 600;
          break;
        case 3: // 左边
          x = 0;
          y = Phaser.Math.Between(0, 600);
          break;
      }
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
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

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示提示文本
    this.add.text(400, 50, 'Use Arrow Keys or WASD to move\nAvoid the red enemies!', {
      fontSize: '20px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);
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

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的角度
      const angle = Phaser.Math.Angle.BetweenPoints(enemy, this.player);
      
      // 使用velocityFromAngle设置追踪速度（360像素/秒）
      const velocity = this.physics.velocityFromAngle(
        Phaser.Math.RadToDeg(angle),
        360
      );
      
      enemy.setVelocity(velocity.x, velocity.y);
      
      // 让敌人朝向玩家
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;
    
    // 停止所有物理对象
    this.physics.pause();
    
    // 玩家变灰
    player.setTint(0x888888);
    
    // 显示游戏结束信息
    this.gameOverText.setText(
      `GAME OVER!\nSurvived: ${(this.survivalTime / 1000).toFixed(1)}s\n\nPress R to Restart`
    ).setVisible(true);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
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