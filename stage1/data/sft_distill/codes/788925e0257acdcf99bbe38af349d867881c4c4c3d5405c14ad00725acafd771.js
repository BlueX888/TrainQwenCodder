class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.PATROL_SPEED = 80;
    this.CHASE_DISTANCE = 150;
    this.PLAYER_SPEED = 200;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      enemies: [],
      timestamp: Date.now()
    };

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

    // 生成8个敌人，分散在场景中
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
      enemy.setBounce(1, 1);
      
      // 初始化敌人状态
      enemy.patrolDirection = index % 2 === 0 ? 1 : -1; // 交替左右方向
      enemy.state = 'patrol'; // 'patrol' 或 'chase'
      enemy.setVelocityX(this.PATROL_SPEED * enemy.patrolDirection);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys: Move Player\nEnemies chase when close!', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 添加状态显示
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log('[GAME_START]', JSON.stringify({
      playerPos: { x: this.player.x, y: this.player.y },
      enemyCount: 8,
      patrolSpeed: this.PATROL_SPEED,
      chaseDistance: this.CHASE_DISTANCE
    }));
  }

  update(time, delta) {
    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.PLAYER_SPEED);
    }

    // 更新敌人行为
    let chasingCount = 0;
    const enemyStates = [];

    this.enemies.children.entries.forEach((enemy, index) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < this.CHASE_DISTANCE) {
        // 追踪模式
        if (enemy.state !== 'chase') {
          enemy.state = 'chase';
          console.log(`[ENEMY_${index}] CHASE_START at distance ${distance.toFixed(2)}`);
        }
        
        this.physics.moveToObject(enemy, this.player, this.PATROL_SPEED);
        chasingCount++;
      } else {
        // 巡逻模式
        if (enemy.state !== 'patrol') {
          enemy.state = 'patrol';
          enemy.setVelocityY(0);
          enemy.setVelocityX(this.PATROL_SPEED * enemy.patrolDirection);
          console.log(`[ENEMY_${index}] PATROL_RESUME direction ${enemy.patrolDirection}`);
        }

        // 检查是否碰到边界，反转方向
        if (enemy.body.blocked.left || enemy.body.blocked.right) {
          enemy.patrolDirection *= -1;
          enemy.setVelocityX(this.PATROL_SPEED * enemy.patrolDirection);
        }
      }

      enemyStates.push({
        index: index,
        state: enemy.state,
        position: { x: Math.round(enemy.x), y: Math.round(enemy.y) },
        distance: Math.round(distance)
      });
    });

    // 更新状态显示
    this.statusText.setText(`Chasing: ${chasingCount}/8`);

    // 更新全局信号
    window.__signals__ = {
      playerPosition: { 
        x: Math.round(this.player.x), 
        y: Math.round(this.player.y) 
      },
      enemies: enemyStates,
      chasingCount: chasingCount,
      timestamp: Date.now()
    };
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