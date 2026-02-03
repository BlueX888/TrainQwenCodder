class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 80;
    this.chaseSpeed = 120;
    
    // 可验证的状态信号
    window.__signals__ = {
      enemiesPatrolling: 0,
      enemiesChasing: 0,
      playerPosition: { x: 0, y: 0 },
      enemyStates: []
    };
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

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成8个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 200, y: 250 },
      { x: 600, y: 250 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 设置初始巡逻方向（随机左右）
      const direction = index % 2 === 0 ? 1 : -1;
      enemy.setVelocityX(this.patrolSpeed * direction);
      
      // 自定义属性
      enemy.isChasing = false;
      enemy.patrolDirection = direction;
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('[GAME_START]', JSON.stringify({
      playerPos: { x: this.player.x, y: this.player.y },
      enemyCount: this.enemies.getChildren().length,
      detectionRange: this.detectionRange
    }));
  }

  update(time, delta) {
    // 玩家移动
    const playerSpeed = 200;
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

    // 更新敌人行为
    let patrolCount = 0;
    let chaseCount = 0;
    const enemyStates = [];

    this.enemies.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否在检测范围内
      if (distance < this.detectionRange) {
        // 追踪模式
        if (!enemy.isChasing) {
          enemy.isChasing = true;
        }
        
        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        this.physics.velocityFromRotation(
          angle,
          this.chaseSpeed,
          enemy.body.velocity
        );
        
        chaseCount++;
        enemyStates.push({
          x: Math.round(enemy.x),
          y: Math.round(enemy.y),
          state: 'chasing',
          distance: Math.round(distance)
        });
      } else {
        // 巡逻模式
        if (enemy.isChasing) {
          enemy.isChasing = false;
          // 恢复巡逻速度
          enemy.setVelocity(this.patrolSpeed * enemy.patrolDirection, 0);
        }

        // 边界检测，反转方向
        if (enemy.x <= 16 || enemy.x >= 784) {
          enemy.patrolDirection *= -1;
          enemy.setVelocityX(this.patrolSpeed * enemy.patrolDirection);
        }
        
        patrolCount++;
        enemyStates.push({
          x: Math.round(enemy.x),
          y: Math.round(enemy.y),
          state: 'patrolling',
          direction: enemy.patrolDirection > 0 ? 'right' : 'left'
        });
      }
    });

    // 更新状态信号
    window.__signals__ = {
      enemiesPatrolling: patrolCount,
      enemiesChasing: chaseCount,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      enemyStates: enemyStates,
      timestamp: time
    };

    // 更新显示文本
    this.statusText.setText([
      `Patrolling: ${patrolCount}`,
      `Chasing: ${chaseCount}`,
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Use Arrow Keys to Move`
    ]);

    // 每秒输出一次状态日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('[GAME_STATE]', JSON.stringify(window.__signals__));
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