class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesAlerted = 0; // 状态信号：被警觉的敌人数量
    this.totalEnemies = 5;
    this.patrolSpeed = 80;
    this.detectionRange = 150; // 检测玩家的距离
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建 5 个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 100 },
      { x: 650, y: 150 },
      { x: 200, y: 400 },
      { x: 600, y: 450 },
      { x: 400, y: 550 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 初始化敌人属性
      enemy.patrolLeft = pos.x - 100; // 巡逻左边界
      enemy.patrolRight = pos.x + 100; // 巡逻右边界
      enemy.setVelocityX(this.patrolSpeed); // 初始向右移动
      enemy.isAlerted = false; // 是否处于追踪状态
      enemy.body.setDrag(0); // 无拖拽，保持恒定速度
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加信息文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 570, 'Use WASD or Arrow Keys to move. Get close to enemies to alert them!', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 重置警觉计数
    this.enemiesAlerted = 0;

    // 更新每个敌人的行为
    this.enemies.getChildren().forEach(enemy => {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      // 检测玩家是否在范围内
      if (distanceToPlayer < this.detectionRange) {
        // 追踪模式
        enemy.isAlerted = true;
        this.enemiesAlerted++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家（追踪速度略快）
        const chaseSpeed = this.patrolSpeed * 1.2;
        enemy.setVelocity(
          Math.cos(angle) * chaseSpeed,
          Math.sin(angle) * chaseSpeed
        );

        // 改变颜色表示警觉状态（红色）
        if (enemy.tint !== 0xff0000) {
          enemy.setTint(0xff0000);
        }
      } else {
        // 巡逻模式
        if (enemy.isAlerted) {
          // 从追踪模式恢复，重置颜色
          enemy.clearTint();
          enemy.isAlerted = false;
          // 恢复水平巡逻
          enemy.setVelocityY(0);
          enemy.setVelocityX(enemy.x < enemy.patrolLeft + 50 ? this.patrolSpeed : -this.patrolSpeed);
        }

        // 左右巡逻逻辑
        if (enemy.x <= enemy.patrolLeft && enemy.body.velocity.x < 0) {
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= enemy.patrolRight && enemy.body.velocity.x > 0) {
          enemy.setVelocityX(-this.patrolSpeed);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Enemies Alerted: ${this.enemiesAlerted}/${this.totalEnemies}\n` +
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
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