class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.enemyStates = [];
    
    // 可验证的状态信号
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      enemyStates: [],
      detectionCount: 0,
      totalDistance: 0
    };
  }

  preload() {
    // 无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0066ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建5个敌人，分布在不同位置
    const enemyPositions = [
      { x: 150, y: 150, minX: 100, maxX: 300 },
      { x: 650, y: 150, minX: 550, maxX: 750 },
      { x: 150, y: 450, minX: 100, maxX: 300 },
      { x: 650, y: 450, minX: 550, maxX: 750 },
      { x: 400, y: 100, minX: 300, maxX: 500 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      
      // 初始化敌人状态
      this.enemyStates[index] = {
        mode: 'patrol', // patrol 或 chase
        patrolMinX: pos.minX,
        patrolMaxX: pos.maxX,
        patrolDirection: 1, // 1=右, -1=左
        detectionRange: 150,
        chaseSpeed: 120,
        patrolSpeed: 80
      };

      // 设置初始巡逻速度
      enemy.setVelocityX(this.enemyStates[index].patrolSpeed);
    });

    // 玩家与敌人碰撞（可选，这里仅作演示）
    this.physics.add.collider(this.player, this.enemies);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 玩家移动控制
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

    // 更新敌人AI
    let detectionCount = 0;
    let totalDistance = 0;
    const enemyStateData = [];

    this.enemies.children.entries.forEach((enemy, index) => {
      const state = this.enemyStates[index];
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      totalDistance += distance;

      // 检测玩家是否在追踪范围内
      if (distance < state.detectionRange) {
        // 切换到追踪模式
        if (state.mode !== 'chase') {
          state.mode = 'chase';
          detectionCount++;
        }

        // 计算追踪方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置追踪速度
        this.physics.velocityFromRotation(
          angle,
          state.chaseSpeed,
          enemy.body.velocity
        );

      } else {
        // 切换回巡逻模式
        if (state.mode === 'chase') {
          state.mode = 'patrol';
          enemy.setVelocityY(0);
        }

        // 巡逻逻辑
        if (state.mode === 'patrol') {
          // 检查是否到达边界
          if (enemy.x >= state.patrolMaxX && state.patrolDirection === 1) {
            state.patrolDirection = -1;
          } else if (enemy.x <= state.patrolMinX && state.patrolDirection === -1) {
            state.patrolDirection = 1;
          }

          // 设置巡逻速度
          enemy.setVelocityX(state.patrolSpeed * state.patrolDirection);
          enemy.setVelocityY(0);
        }
      }

      // 收集状态数据
      enemyStateData.push({
        index: index,
        mode: state.mode,
        position: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
        velocity: { x: Math.round(enemy.body.velocity.x), y: Math.round(enemy.body.velocity.y) },
        distanceToPlayer: Math.round(distance)
      });
    });

    // 更新全局信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyStates = enemyStateData;
    window.__signals__.detectionCount = detectionCount;
    window.__signals__.totalDistance = Math.round(totalDistance);

    // 更新状态文本
    const chasingEnemies = enemyStateData.filter(e => e.mode === 'chase').length;
    this.statusText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Chasing Enemies: ${chasingEnemies}/5`,
      `Use Arrow Keys to Move`,
      `Get close to enemies to trigger chase mode`
    ]);

    // 输出日志（每60帧输出一次，约1秒）
    if (time % 1000 < 16) {
      console.log(JSON.stringify({
        timestamp: Math.round(time),
        player: window.__signals__.playerPosition,
        chasingCount: chasingEnemies,
        avgDistance: Math.round(totalDistance / 5)
      }));
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