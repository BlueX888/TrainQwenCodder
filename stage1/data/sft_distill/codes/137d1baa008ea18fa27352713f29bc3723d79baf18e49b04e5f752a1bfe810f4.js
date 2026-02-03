class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.enemyData = [];
    this.signals = [];
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

    // 创建3个敌人，分布在不同位置
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 400, y: 450 },
      { x: 600, y: 250 }
    ];

    enemyPositions.forEach((pos, index) => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      
      // 为每个敌人存储巡逻数据
      this.enemyData[index] = {
        id: index,
        mode: 'patrol', // patrol 或 chase
        patrolLeft: pos.x - 150,
        patrolRight: pos.x + 150,
        direction: 1, // 1为右，-1为左
        detectionRange: 150,
        chaseSpeed: 200,
        patrolSpeed: 200
      };

      // 设置初始速度
      enemy.setVelocityX(this.enemyData[index].patrolSpeed * this.enemyData[index].direction);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 初始化全局信号对象
    window.__signals__ = {
      playerPosition: { x: 400, y: 300 },
      enemies: [],
      frame: 0
    };

    this.logSignal('game_start', { enemyCount: 3 });
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

    // 更新每个敌人的行为
    this.enemies.children.entries.forEach((enemy, index) => {
      const data = this.enemyData[index];
      const distanceToPlayer = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      const previousMode = data.mode;

      // 判断是否应该追踪玩家
      if (distanceToPlayer < data.detectionRange) {
        data.mode = 'chase';
      } else {
        data.mode = 'patrol';
      }

      // 模式切换时记录信号
      if (previousMode !== data.mode) {
        this.logSignal('enemy_mode_change', {
          enemyId: index,
          oldMode: previousMode,
          newMode: data.mode,
          distance: Math.round(distanceToPlayer)
        });
      }

      if (data.mode === 'chase') {
        // 追踪模式：朝玩家方向移动
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        
        enemy.setVelocity(
          Math.cos(angle) * data.chaseSpeed,
          Math.sin(angle) * data.chaseSpeed
        );
      } else {
        // 巡逻模式：左右往返
        enemy.setVelocityY(0);
        
        // 检查是否到达边界
        if (enemy.x <= data.patrolLeft && data.direction === -1) {
          data.direction = 1;
          this.logSignal('enemy_patrol_turn', {
            enemyId: index,
            position: 'left',
            x: Math.round(enemy.x)
          });
        } else if (enemy.x >= data.patrolRight && data.direction === 1) {
          data.direction = -1;
          this.logSignal('enemy_patrol_turn', {
            enemyId: index,
            position: 'right',
            x: Math.round(enemy.x)
          });
        }

        enemy.setVelocityX(data.patrolSpeed * data.direction);
      }
    });

    // 更新状态显示
    this.updateStatusDisplay();

    // 更新全局信号
    this.updateGlobalSignals();
  }

  updateStatusDisplay() {
    let statusLines = ['Use Arrow Keys to Move Player\n'];
    
    this.enemies.children.entries.forEach((enemy, index) => {
      const data = this.enemyData[index];
      const distance = Math.round(Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      ));
      
      statusLines.push(
        `Enemy ${index + 1}: ${data.mode.toUpperCase()} | Dist: ${distance}px`
      );
    });

    this.statusText.setText(statusLines.join('\n'));
  }

  updateGlobalSignals() {
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    window.__signals__.enemies = this.enemies.children.entries.map((enemy, index) => ({
      id: index,
      x: Math.round(enemy.x),
      y: Math.round(enemy.y),
      mode: this.enemyData[index].mode,
      velocityX: Math.round(enemy.body.velocity.x),
      velocityY: Math.round(enemy.body.velocity.y)
    }));

    window.__signals__.frame++;
  }

  logSignal(event, data) {
    const signal = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    
    this.signals.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
    
    // 保持最近100条信号
    if (this.signals.length > 100) {
      this.signals.shift();
    }
    
    window.__signals__.lastSignal = signal;
    window.__signals__.signalHistory = this.signals;
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