class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证状态信号：存活时间
    this.isGameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
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
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800); // 添加阻力使移动更平滑
    this.player.setMaxVelocity(300); // 玩家最大速度

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在随机位置生成10个敌人
    for (let i = 0; i < 10; i++) {
      let x, y;
      // 确保敌人不会生成在玩家附近
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

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Survival Time: 0.0s', {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.timeText.setScrollFactor(0);
    this.timeText.setDepth(100);

    // 显示说明
    this.instructionText = this.add.text(width / 2, 50, 'Use Arrow Keys or WASD to move\nAvoid the red enemies!', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 },
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);
    this.instructionText.setDepth(100);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setDepth(100);
    this.gameOverText.setVisible(false);

    // 初始化时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
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

    // 让每个敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的角度
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );
      
      // 设置敌人速度朝向玩家，速度为240
      const speed = 240;
      enemy.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      
      // 让敌人旋转朝向玩家
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
    
    // 玩家变红
    player.setTint(0xff0000);
    
    // 显示游戏结束文本
    this.gameOverText.setText(`GAME OVER!\nSurvived: ${this.survivalTime.toFixed(1)}s\n\nPress R to Restart`);
    this.gameOverText.setVisible(true);
    
    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });

    // 输出可验证状态到控制台
    console.log('Game Over - Survival Time:', this.survivalTime.toFixed(2), 'seconds');
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