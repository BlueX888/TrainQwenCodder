class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人精灵
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建3个敌人
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 设置镜头跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 添加碰撞检测
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建生命值文本（固定在镜头左上角）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上

    // 创建提示文本
    this.instructionText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.instructionText.setScrollFactor(0);

    // 创建震动状态文本
    this.shakeText = this.add.text(16, 80, '', {
      fontSize: '16px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.shakeText.setScrollFactor(0);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 输出初始状态
    console.log('Game started - Initial health:', this.health);
  }

  handleCollision(player, enemy) {
    // 如果正在震动中，避免重复触发
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发镜头震动（持续1秒）
    this.cameras.main.shake(1000, 0.01);
    this.isShaking = true;
    this.shakeText.setText('CAMERA SHAKING!');

    // 输出碰撞信息
    console.log('Collision detected! Health:', this.health, '- Shaking camera for 1 second');

    // 短暂无敌时间，将玩家推开
    this.physics.moveToObject(player, enemy, -200);

    // 1秒后重置震动状态
    this.time.delayedCall(1000, () => {
      this.isShaking = false;
      this.shakeText.setText('');
      console.log('Camera shake ended');
    });

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
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    console.log('Game Over - Final health:', this.health);
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
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);