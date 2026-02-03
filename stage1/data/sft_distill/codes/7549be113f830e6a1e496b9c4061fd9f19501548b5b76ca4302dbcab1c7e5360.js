class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.enemyData = [];
    this.cursors = null;
    this.PATROL_SPEED = 120;
    this.CHASE_DISTANCE = 150;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建8个敌人，分布在不同位置
    const positions = [
      { x: 100, y: 100, minX: 50, maxX: 250 },
      { x: 700, y: 100, minX: 550, maxX: 750 },
      { x: 100, y: 300, minX: 50, maxX: 250 },
      { x: 700, y: 300, minX: 550, maxX: 750 },
      { x: 100, y: 500, minX: 50, maxX: 250 },
      { x: 700, y: 500, minX: 550, maxX: 750 },
      { x: 400, y: 150, minX: 300, maxX: 500 },
      { x: 400, y: 450, minX: 300, maxX: 500 }
    ];

    positions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(this.PATROL_SPEED);
      
      // 存储每个敌人的巡逻数据
      this.enemyData[index] = {
        sprite: enemy,
        minX: pos.minX,
        maxX: pos.maxX,
        isChasing: false,
        direction: 1 // 1为右，-1为左
      };
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化信号系统
    window.__signals__ = {
      player: { x: 0, y: 0 },
      enemies: [],
      totalEnemies: 8,
      chasingCount: 0,
      patrollingCount: 8
    };

    // 添加说明文字
    this.add.text(10, 10, 'Arrow Keys to Move\nEnemies chase when close', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    const PLAYER_SPEED = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(PLAYER_SPEED);
    }

    // 更新每个敌人的行为
    let chasingCount = 0;
    const enemyStates = [];

    this.enemyData.forEach((data, index) => {
      const enemy = data.sprite;
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      // 判断是否进入追踪模式
      if (distance < this.CHASE_DISTANCE) {
        data.isChasing = true;
        chasingCount++;

        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        enemy.setVelocity(
          Math.cos(angle) * this.PATROL_SPEED,
          Math.sin(angle) * this.PATROL_SPEED
        );
      } else {
        data.isChasing = false;

        // 巡逻模式：左右往返
        enemy.setVelocityY(0);
        
        // 检查是否到达边界
        if (enemy.x >= data.maxX && data.direction === 1) {
          data.direction = -1;
          enemy.setVelocityX(-this.PATROL_SPEED);
        } else if (enemy.x <= data.minX && data.direction === -1) {
          data.direction = 1;
          enemy.setVelocityX(this.PATROL_SPEED);
        } else {
          enemy.setVelocityX(data.direction * this.PATROL_SPEED);
        }
      }

      // 记录敌人状态
      enemyStates.push({
        id: index,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        state: data.isChasing ? 'chasing' : 'patrolling',
        distance: Math.round(distance),
        velocityX: Math.round(enemy.body.velocity.x),
        velocityY: Math.round(enemy.body.velocity.y)
      });
    });

    // 更新信号
    window.__signals__ = {
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      enemies: enemyStates,
      totalEnemies: 8,
      chasingCount: chasingCount,
      patrollingCount: 8 - chasingCount,
      timestamp: Date.now()
    };

    // 每秒输出一次日志
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log(JSON.stringify({
        type: 'GAME_STATE',
        playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        chasing: chasingCount,
        patrolling: 8 - chasingCount,
        time: Math.round(time / 1000)
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