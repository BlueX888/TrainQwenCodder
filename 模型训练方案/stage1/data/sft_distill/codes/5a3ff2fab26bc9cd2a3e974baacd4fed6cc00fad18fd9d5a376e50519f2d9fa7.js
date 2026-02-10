class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.isShaking = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵（带物理）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    });

    // 设置摄像机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.cameras.main.setBounds(0, 0, 1600, 1200);

    // 添加玩家与敌人的碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 敌人之间的碰撞
    this.physics.add.collider(this.enemies, this.enemies);

    // 创建生命值显示文本（固定在摄像机上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在摄像机上
    this.healthText.setDepth(100);

    // 创建震屏状态提示文本
    this.shakeText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.shakeText.setScrollFactor(0);
    this.shakeText.setDepth(100);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加背景网格（方便观察摄像机移动）
    this.createGrid();

    // 添加提示文本
    const instructionText = this.add.text(400, 600, 'Use Arrow Keys to Move\nCollide with Red Enemies to Trigger Shake', {
      fontSize: '18px',
      fill: '#ffff00',
      align: 'center'
    });
    instructionText.setOrigin(0.5);
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制网格
    for (let x = 0; x <= 1600; x += 100) {
      graphics.lineBetween(x, 0, x, 1200);
    }
    for (let y = 0; y <= 1200; y += 100) {
      graphics.lineBetween(0, y, 1600, y);
    }
  }

  handleCollision(player, enemy) {
    // 避免重复触发
    if (this.isShaking) {
      return;
    }

    this.isShaking = true;

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值显示
    this.updateHealthDisplay();

    // 触发摄像机震动效果 1.5 秒
    this.cameras.main.shake(1500, 0.01); // 1500ms, 强度0.01

    // 显示震屏提示
    this.shakeText.setText('CAMERA SHAKING!');

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 7
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // 1.5秒后重置状态
    this.time.delayedCall(1500, () => {
      this.isShaking = false;
      this.shakeText.setText('');
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  updateHealthDisplay() {
    this.healthText.setText(`Health: ${this.health}`);
    
    // 根据生命值改变颜色
    if (this.health > 60) {
      this.healthText.setFill('#00ff00');
    } else if (this.health > 30) {
      this.healthText.setFill('#ffff00');
    } else {
      this.healthText.setFill('#ff0000');
    }
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(this.player.x, this.player.y - 50, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    // 重启提示
    const restartText = this.add.text(this.player.x, this.player.y + 20, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
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
  }
}

// 游戏配置
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

// 创建游戏实例
new Phaser.Game(config);