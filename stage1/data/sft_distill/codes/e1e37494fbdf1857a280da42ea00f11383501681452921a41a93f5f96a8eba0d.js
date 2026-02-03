// 游戏状态信号
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  enemies: [],
  totalEnemies: 8,
  chasingCount: 0,
  patrollingCount: 8
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.ENEMY_SPEED = 240;
    this.CHASE_DISTANCE = 200;
    this.ENEMY_COUNT = 8;
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

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成8个敌人，随机分布
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 },
      { x: 100, y: 300 },
      { x: 700, y: 300 },
      { x: 400, y: 500 }
    ];

    for (let i = 0; i < this.ENEMY_COUNT; i++) {
      const pos = positions[i];
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置敌人自定义属性
      enemy.patrolDirection = Math.random() < 0.5 ? -1 : 1; // 随机初始方向
      enemy.isChasing = false;
      enemy.patrolMinX = 50;
      enemy.patrolMaxX = 750;
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.ENEMY_SPEED * enemy.patrolDirection);
    }

    // 添加碰撞检测（可选，防止敌人重叠）
    this.physics.add.collider(this.enemies, this.enemies);

    // 调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('[GAME] Scene created with 8 enemies');
  }

  update(time, delta) {
    // 玩家控制
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
    let chasingCount = 0;
    let patrollingCount = 0;
    const enemyStates = [];

    this.enemies.getChildren().forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < this.CHASE_DISTANCE) {
        // 追踪模式
        enemy.isChasing = true;
        chasingCount++;
        
        // 使用 moveToObject 追踪玩家
        this.physics.moveToObject(enemy, this.player, this.ENEMY_SPEED);
        
      } else {
        // 巡逻模式
        enemy.isChasing = false;
        patrollingCount++;
        
        // 左右巡逻
        if (enemy.x <= enemy.patrolMinX) {
          enemy.patrolDirection = 1;
          enemy.setVelocityX(this.ENEMY_SPEED * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.patrolDirection = -1;
          enemy.setVelocityX(this.ENEMY_SPEED * enemy.patrolDirection);
          enemy.setVelocityY(0);
        } else {
          // 保持当前方向
          enemy.setVelocityX(this.ENEMY_SPEED * enemy.patrolDirection);
          enemy.setVelocityY(0);
        }
      }

      // 记录敌人状态
      enemyStates.push({
        id: index,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        state: enemy.isChasing ? 'chasing' : 'patrolling',
        distance: Math.round(distance)
      });
    });

    // 更新全局信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemies = enemyStates;
    window.__signals__.chasingCount = chasingCount;
    window.__signals__.patrollingCount = patrollingCount;

    // 更新调试文本
    this.debugText.setText([
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Chasing: ${chasingCount} | Patrolling: ${patrollingCount}`,
      `Use Arrow Keys to Move`,
      `Chase Distance: ${this.CHASE_DISTANCE}px`
    ]);

    // 定期输出日志
    if (Math.floor(time) % 2000 < 16) {
      console.log(JSON.stringify({
        time: Math.round(time),
        player: window.__signals__.playerPosition,
        chasing: chasingCount,
        patrolling: patrollingCount
      }));
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);

console.log('[GAME] Game initialized with 8 patrolling enemies');
console.log('[GAME] Enemy speed: 240, Chase distance: 200px');