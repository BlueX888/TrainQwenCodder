class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemyDetectionRange = 150; // 检测范围
    this.enemySpeed = 240;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化signals
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      enemies: [],
      totalStateChanges: 0
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
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
      { x: 200, y: 400 },
      { x: 600, y: 400 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 初始化敌人状态
      enemy.enemyData = {
        id: index,
        state: 'patrol', // patrol 或 chase
        patrolDirection: index % 2 === 0 ? 1 : -1, // 左右巡逻方向
        patrolMinX: pos.x - 100,
        patrolMaxX: pos.x + 100
      };

      // 设置初始巡逻速度
      enemy.setVelocityX(this.enemySpeed * enemy.enemyData.patrolDirection);

      // 添加到signals
      window.__signals__.enemies.push({
        id: index,
        state: 'patrol',
        position: { x: pos.x, y: pos.y }
      });
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
      enemyCount: 8,
      detectionRange: this.enemyDetectionRange
    }));
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

    // 更新玩家位置信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    let chasingCount = 0;
    let patrollingCount = 0;

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      const previousState = enemy.enemyData.state;

      // 检测玩家距离，决定状态
      if (distance < this.enemyDetectionRange) {
        // 追踪模式
        if (enemy.enemyData.state !== 'chase') {
          enemy.enemyData.state = 'chase';
          window.__signals__.totalStateChanges++;
          
          console.log('[STATE_CHANGE]', JSON.stringify({
            enemyId: enemy.enemyData.id,
            from: previousState,
            to: 'chase',
            distance: Math.round(distance),
            time: Math.round(time)
          }));
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        enemy.setVelocity(
          Math.cos(angle) * this.enemySpeed,
          Math.sin(angle) * this.enemySpeed
        );

        chasingCount++;
      } else {
        // 巡逻模式
        if (enemy.enemyData.state !== 'patrol') {
          enemy.enemyData.state = 'patrol';
          window.__signals__.totalStateChanges++;
          
          console.log('[STATE_CHANGE]', JSON.stringify({
            enemyId: enemy.enemyData.id,
            from: previousState,
            to: 'patrol',
            distance: Math.round(distance),
            time: Math.round(time)
          }));
        }

        // 巡逻逻辑：左右往返
        if (enemy.x <= enemy.enemyData.patrolMinX) {
          enemy.enemyData.patrolDirection = 1;
        } else if (enemy.x >= enemy.enemyData.patrolMaxX) {
          enemy.enemyData.patrolDirection = -1;
        }

        enemy.setVelocityX(this.enemySpeed * enemy.enemyData.patrolDirection);
        enemy.setVelocityY(0);

        patrollingCount++;
      }

      // 更新敌人信号
      window.__signals__.enemies[index] = {
        id: enemy.enemyData.id,
        state: enemy.enemyData.state,
        position: {
          x: Math.round(enemy.x),
          y: Math.round(enemy.y)
        },
        distanceToPlayer: Math.round(distance)
      };
    });

    // 更新状态文本
    this.statusText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Chasing: ${chasingCount} | Patrolling: ${patrollingCount}`,
      `State Changes: ${window.__signals__.totalStateChanges}`,
      `Use Arrow Keys to Move`
    ]);
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