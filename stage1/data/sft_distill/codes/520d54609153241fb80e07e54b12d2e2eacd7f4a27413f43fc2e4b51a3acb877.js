class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.enemySpeed = 160;
    this.detectionRange = 200;
    this.playerSpeed = 200;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      patrollingCount: 0,
      chasingCount: 0,
      playerPosition: { x: 0, y: 0 },
      enemyStates: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成15个敌人
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      
      // 设置敌人属性
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 0);
      
      // 自定义数据：巡逻方向和状态
      enemy.setData('direction', Phaser.Math.Between(0, 1) === 0 ? -1 : 1);
      enemy.setData('state', 'patrol'); // patrol 或 chase
      enemy.setData('patrolMinX', Math.max(50, x - 150));
      enemy.setData('patrolMaxX', Math.min(750, x + 150));
      
      // 设置初始速度
      enemy.setVelocityX(this.enemySpeed * enemy.getData('direction'));
    }

    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 30, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 更新敌人行为
    let patrollingCount = 0;
    let chasingCount = 0;
    const enemyStates = [];

    this.enemies.children.entries.forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      const currentState = enemy.getData('state');
      let newState = currentState;

      // 状态切换逻辑
      if (distance < this.detectionRange) {
        newState = 'chase';
      } else {
        newState = 'patrol';
      }

      enemy.setData('state', newState);

      // 根据状态执行不同行为
      if (newState === 'chase') {
        chasingCount++;
        // 追踪玩家
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );
        enemy.setVelocity(
          Math.cos(angle) * this.enemySpeed,
          Math.sin(angle) * this.enemySpeed
        );
      } else {
        patrollingCount++;
        // 巡逻模式
        const direction = enemy.getData('direction');
        const minX = enemy.getData('patrolMinX');
        const maxX = enemy.getData('patrolMaxX');

        // 检查是否到达边界，反转方向
        if (enemy.x <= minX && direction === -1) {
          enemy.setData('direction', 1);
          enemy.setVelocityX(this.enemySpeed);
        } else if (enemy.x >= maxX && direction === 1) {
          enemy.setData('direction', -1);
          enemy.setVelocityX(-this.enemySpeed);
        } else {
          enemy.setVelocityX(this.enemySpeed * direction);
        }
        
        enemy.setVelocityY(0);
      }

      // 记录敌人状态
      enemyStates.push({
        id: index,
        state: newState,
        x: Math.round(enemy.x),
        y: Math.round(enemy.y),
        distance: Math.round(distance)
      });
    });

    // 更新信号
    window.__signals__.patrollingCount = patrollingCount;
    window.__signals__.chasingCount = chasingCount;
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyStates = enemyStates;

    // 更新状态文本
    this.statusText.setText(
      `Patrolling: ${patrollingCount} | Chasing: ${chasingCount}`
    );

    // 定期输出日志（每秒一次）
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      console.log(JSON.stringify({
        timestamp: Math.round(time),
        patrolling: patrollingCount,
        chasing: chasingCount,
        player: window.__signals__.playerPosition
      }));
      this.lastLogTime = time;
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