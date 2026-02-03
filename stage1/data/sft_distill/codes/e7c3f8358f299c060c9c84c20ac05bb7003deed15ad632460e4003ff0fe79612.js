class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.enemyStates = []; // 存储每个敌人的状态
    this.detectionRange = 150; // 检测范围
    this.patrolSpeed = 160;
    
    // 可验证的状态信号
    window.__signals__ = {
      enemiesPatrolling: 0,
      enemiesChasing: 0,
      playerPosition: { x: 0, y: 0 },
      enemyPositions: [],
      timestamp: 0
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
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成10个敌人，分布在不同位置
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 150;
      const y = 100 + Math.floor(i / 5) * 300;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 初始化敌人状态
      this.enemyStates[i] = {
        mode: 'patrol', // 'patrol' 或 'chase'
        patrolDirection: 1, // 1为右，-1为左
        minX: x - 100,
        maxX: x + 100
      };
      
      // 设置初始巡逻速度
      enemy.setVelocityX(this.patrolSpeed * this.enemyStates[i].patrolDirection);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    console.log('Game initialized with 10 pink enemies');
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

    // 更新每个敌人的行为
    let patrolCount = 0;
    let chaseCount = 0;
    const enemyPositions = [];

    this.enemies.children.entries.forEach((enemy, index) => {
      const state = this.enemyStates[index];
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      enemyPositions.push({
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        mode: state.mode
      });

      // 判断是否切换模式
      if (distance < this.detectionRange) {
        // 进入追踪模式
        if (state.mode !== 'chase') {
          state.mode = 'chase';
        }
        
        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        this.physics.velocityFromRotation(
          angle,
          this.patrolSpeed,
          enemy.body.velocity
        );
        
        chaseCount++;
      } else {
        // 进入巡逻模式
        if (state.mode !== 'patrol') {
          state.mode = 'patrol';
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.patrolSpeed * state.patrolDirection);
        }
        
        // 巡逻边界检测
        if (enemy.x <= state.minX) {
          state.patrolDirection = 1;
          enemy.setVelocityX(this.patrolSpeed);
        } else if (enemy.x >= state.maxX) {
          state.patrolDirection = -1;
          enemy.setVelocityX(-this.patrolSpeed);
        }
        
        patrolCount++;
      }
    });

    // 更新状态信号
    window.__signals__.enemiesPatrolling = patrolCount;
    window.__signals__.enemiesChasing = chaseCount;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyPositions = enemyPositions;
    window.__signals__.timestamp = time;

    // 更新显示文本
    this.statusText.setText([
      `Patrolling: ${patrolCount}`,
      `Chasing: ${chaseCount}`,
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Use Arrow Keys to Move`
    ]);

    // 每秒输出一次状态日志
    if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
      console.log(JSON.stringify({
        time: Math.floor(time / 1000),
        patrolling: patrolCount,
        chasing: chaseCount,
        playerPos: window.__signals__.playerPosition
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