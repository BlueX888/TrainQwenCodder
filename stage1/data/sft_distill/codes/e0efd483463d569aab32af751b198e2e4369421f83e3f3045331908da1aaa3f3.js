class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemiesChasing = 0; // 状态信号：当前追踪玩家的敌人数量
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

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，分别在不同位置
    const enemyPositions = [
      { x: 150, y: 150 },
      { x: 400, y: 100 },
      { x: 650, y: 200 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置初始巡逻方向（随机向左或向右）
      enemy.patrolDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      enemy.setVelocityX(300 * enemy.patrolDirection);
      
      // 标记敌人状态
      enemy.isChasing = false;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 550, '使用方向键移动玩家 | 敌人接近时会追踪', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 重置追踪计数
    this.enemiesChasing = 0;

    // 敌人AI逻辑
    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      const chaseDistance = 200; // 追踪触发距离
      const patrolSpeed = 300;
      const chaseSpeed = 250;

      if (distance < chaseDistance) {
        // 追踪模式
        enemy.isChasing = true;
        this.enemiesChasing++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置速度朝向玩家
        this.physics.velocityFromRotation(angle, chaseSpeed, enemy.body.velocity);

      } else {
        // 巡逻模式
        enemy.isChasing = false;

        // 检测是否碰到世界边界，反向移动
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          enemy.patrolDirection *= -1;
        }

        // 保持水平巡逻
        enemy.setVelocityX(patrolSpeed * enemy.patrolDirection);
        enemy.setVelocityY(0);
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `追踪中的敌人: ${this.enemiesChasing}/3\n` +
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
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