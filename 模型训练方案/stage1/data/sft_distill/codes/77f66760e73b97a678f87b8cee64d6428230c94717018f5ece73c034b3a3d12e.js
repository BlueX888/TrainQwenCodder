class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：正在追踪玩家的敌人数量
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 500, y: 100 },
      { x: 700, y: 100 }, { x: 100, y: 250 }, { x: 300, y: 250 },
      { x: 500, y: 250 }, { x: 700, y: 250 }, { x: 100, y: 400 },
      { x: 300, y: 400 }, { x: 500, y: 400 }, { x: 700, y: 400 },
      { x: 200, y: 500 }, { x: 400, y: 500 }, { x: 600, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人设置自定义属性
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 初始巡逻方向（1右，-1左）
      enemy.patrolSpeed = 200;
      enemy.chaseSpeed = 200;
      enemy.detectionRange = 150; // 检测玩家的距离
      enemy.isChasing = false; // 是否处于追踪状态
      enemy.patrolLeft = pos.x - 100; // 巡逻左边界
      enemy.patrolRight = pos.x + 100; // 巡逻右边界
      
      // 设置初始速度
      enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家控制
    const playerSpeed = 250;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        enemy.setVelocity(
          Math.cos(angle) * enemy.chaseSpeed,
          Math.sin(angle) * enemy.chaseSpeed
        );

        // 改变颜色表示追踪状态（红色）
        enemy.setTint(0xff0000);
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocityY(0);
        }

        // 恢复绿色
        enemy.clearTint();

        // 巡逻逻辑：左右往返
        if (enemy.x <= enemy.patrolLeft) {
          enemy.patrolDirection = 1; // 向右
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        } else if (enemy.x >= enemy.patrolRight) {
          enemy.patrolDirection = -1; // 向左
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        } else {
          // 保持当前巡逻方向
          enemy.setVelocityX(enemy.patrolDirection * enemy.patrolSpeed);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText(
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `追踪中的敌人: ${this.enemiesChasing} / 15\n` +
      `使用方向键移动玩家`
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