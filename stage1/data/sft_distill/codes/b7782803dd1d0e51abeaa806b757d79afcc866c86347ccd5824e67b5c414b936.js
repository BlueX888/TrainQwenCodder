class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
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
    
    // 生成10个敌人，随机分布在场景边缘
    for (let i = 0; i < 10; i++) {
      let x, y;
      const side = Phaser.Math.Between(0, 3);
      
      switch(side) {
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
      enemy.setBounce(1);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

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
    const acceleration = 400;
    
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
        enemy.x, 
        enemy.y, 
        this.player.x, 
        this.player.y
      );

      // 设置敌人速度，朝向玩家移动
      const speed = 120;
      this.physics.velocityFromRotation(angle, speed, enemy.body.velocity);

      // 让敌人旋转面向玩家
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    this.gameOver = true;

    // 停止所有移动
    player.setVelocity(0);
    player.setAcceleration(0);
    this.enemies.setVelocityX(0);
    this.enemies.setVelocityY(0);

    // 显示游戏结束信息
    this.statusText.setText(`GAME OVER!\nSurvived: ${this.survivalTime.toFixed(1)}s`);
    this.statusText.setVisible(true);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      repeat: 5,
      yoyo: true
    });

    console.log('Game Over! Survival Time:', this.survivalTime.toFixed(1), 'seconds');
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

const game = new Phaser.Game(config);