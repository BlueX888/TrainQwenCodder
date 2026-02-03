class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemies = [];
    this.signals = {
      playerPosition: { x: 0, y: 0 },
      enemyStates: [],
      timestamp: 0
    };
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建8个敌人
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 250, y: 250 },
      { x: 550, y: 250 },
      { x: 250, y: 450 },
      { x: 550, y: 450 }
    ];

    for (let i = 0; i < 8; i++) {
      const enemy = this.physics.add.sprite(positions[i].x, positions[i].y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置敌人的自定义属性
      enemy.patrolSpeed = 80;
      enemy.chaseSpeed = 120;
      enemy.detectionRange = 150;
      enemy.patrolDirection = Math.random() > 0.5 ? 1 : -1; // 随机初始方向
      enemy.isChasing = false;
      enemy.patrolBounds = {
        left: positions[i].x - 100,
        right: positions[i].x + 100
      };
      
      // 设置初始巡逻速度
      enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
      
      this.enemies.push(enemy);
    }

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 暴露signals到window
    window.__signals__ = this.signals;

    console.log(JSON.stringify({
      type: 'GAME_START',
      enemyCount: 8,
      playerPosition: { x: this.player.x, y: this.player.y }
    }));
  }

  update(time, delta) {
    // 更新时间戳
    this.signals.timestamp = time;

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
    this.signals.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 更新每个敌人的行为
    let chasingCount = 0;
    this.signals.enemyStates = [];

    this.enemies.forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      const wasChasing = enemy.isChasing;

      // 判断是否应该追踪玩家
      if (distance < enemy.detectionRange) {
        enemy.isChasing = true;
        chasingCount++;

        // 计算朝向玩家的方向
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        // 设置追踪速度
        enemy.setVelocity(
          Math.cos(angle) * enemy.chaseSpeed,
          Math.sin(angle) * enemy.chaseSpeed
        );

        // 状态切换日志
        if (!wasChasing) {
          console.log(JSON.stringify({
            type: 'ENEMY_STATE_CHANGE',
            enemyIndex: index,
            state: 'CHASING',
            distance: Math.round(distance),
            timestamp: time
          }));
        }
      } else {
        enemy.isChasing = false;

        // 巡逻模式
        // 检查是否到达巡逻边界
        if (enemy.x <= enemy.patrolBounds.left) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        } else if (enemy.x >= enemy.patrolBounds.right) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }

        // 保持巡逻速度
        if (Math.abs(enemy.body.velocity.x) < enemy.patrolSpeed - 10) {
          enemy.setVelocityX(enemy.patrolSpeed * enemy.patrolDirection);
        }

        enemy.setVelocityY(0);

        // 状态切换日志
        if (wasChasing) {
          console.log(JSON.stringify({
            type: 'ENEMY_STATE_CHANGE',
            enemyIndex: index,
            state: 'PATROLLING',
            distance: Math.round(distance),
            timestamp: time
          }));
        }
      }

      // 记录敌人状态到signals
      this.signals.enemyStates.push({
        index: index,
        position: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
        state: enemy.isChasing ? 'CHASING' : 'PATROLLING',
        distance: Math.round(distance),
        velocity: {
          x: Math.round(enemy.body.velocity.x),
          y: Math.round(enemy.body.velocity.y)
        }
      });
    });

    // 更新状态文本
    this.statusText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Enemies Chasing: ${chasingCount}/8`,
      `Use Arrow Keys to Move`,
      `Detection Range: 150px`
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