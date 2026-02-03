class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 200;
    this.chaseSpeed = 200;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      player: { x: 0, y: 0 },
      enemies: [],
      timestamp: Date.now()
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, direction: 1 },
      { x: 400, y: 100, direction: -1 },
      { x: 650, y: 450, direction: 1 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 自定义属性
      enemy.patrolDirection = pos.direction; // 1=右, -1=左
      enemy.isChasing = false;
      enemy.enemyId = index;
      enemy.initialY = pos.y; // 记录初始Y坐标，巡逻时保持
      
      // 初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加边界文本提示
    this.add.text(10, 10, 'Arrow Keys: Move Player\nPink enemies patrol & chase when close', {
      fontSize: '16px',
      fill: '#fff'
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // 更新信号 - 玩家位置
    window.__signals__.player = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 更新敌人逻辑
    const enemyStates = [];
    let chasingCount = 0;

    this.enemies.children.entries.forEach(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      // 判断是否应该追踪
      const shouldChase = distance < this.detectionRange;

      if (shouldChase) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }

        // 计算朝向玩家的方向向量
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          this.chaseSpeed,
          enemy.body.velocity
        );

        chasingCount++;
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }

        // 检测边界并反向
        if (enemy.x <= 20 && enemy.patrolDirection === -1) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= 780 && enemy.patrolDirection === 1) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        }
      }

      // 记录敌人状态
      enemyStates.push({
        id: enemy.enemyId,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        state: enemy.isChasing ? 'chasing' : 'patrolling',
        distance: Math.round(distance),
        velocityX: Math.round(enemy.body.velocity.x),
        velocityY: Math.round(enemy.body.velocity.y)
      });
    });

    // 更新信号 - 敌人状态
    window.__signals__.enemies = enemyStates;
    window.__signals__.chasingCount = chasingCount;
    window.__signals__.timestamp = Date.now();

    // 更新状态文本
    this.statusText.setText(
      `Chasing: ${chasingCount}/3 | Detection Range: ${this.detectionRange}px`
    );

    // 输出日志（每60帧输出一次，避免刷屏）
    if (time % 1000 < 20) {
      console.log(JSON.stringify(window.__signals__, null, 2));
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