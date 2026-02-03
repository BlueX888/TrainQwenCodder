class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成5个敌人在不同位置
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      // 给每个敌人随机速度
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    });

    // 设置镜头跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建生命值显示文本（固定在镜头左上角）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头位置，不随镜头移动

    // 添加提示文本
    this.instructionText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.instructionText.setScrollFactor(0);

    // 添加震动状态文本
    this.shakeText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.shakeText.setScrollFactor(0);
  }

  handleCollision(player, enemy) {
    // 避免重复触发（震动期间不再扣血）
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) this.health = 0;

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发镜头震动 1.5 秒（1500 毫秒）
    this.cameras.main.shake(1500, 0.01);
    
    // 设置震动状态
    this.isShaking = true;
    this.shakeText.setText('CAMERA SHAKING!');

    // 1.5秒后重置震动状态
    this.time.delayedCall(1500, () => {
      this.isShaking = false;
      this.shakeText.setText('');
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // 重启提示
    const restartText = this.add.text(400, 370, 'Refresh to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);
    restartText.setScrollFactor(0);
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.health > 0) {
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