class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 8;
    this.enemySpeed = 200;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.remainingEnemies = 0;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 添加碰撞检测（玩家与敌人）
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 添加点击事件消灭敌人
    this.input.on('pointerdown', (pointer) => {
      this.enemies.children.entries.forEach((enemy) => {
        const bounds = enemy.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          this.destroyEnemy(enemy);
        }
      });
    });

    // 创建UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 84, '', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.remainingEnemies = this.enemiesPerWave;
    this.statusText.setText('Wave Active!');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      // 使用固定种子生成位置（基于波次和索引）
      const seed = this.currentWave * 1000 + i;
      const x = 100 + (seed % 600);
      const y = 50 + ((seed * 7) % 150);

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置敌人数据
      enemy.setData('health', 1);
      enemy.setData('waveId', this.currentWave);
    }

    this.updateUI();
  }

  destroyEnemy(enemy) {
    if (!enemy.active) return;

    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否所有敌人都被消灭
    if (this.remainingEnemies <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2s...');
      
      // 2秒后开始下一波
      this.time.addEvent({
        delay: this.waveDelay,
        callback: () => {
          this.currentWave++;
          this.startWave();
        },
        callbackScope: this
      });
    }
  }

  hitEnemy(player, enemy) {
    // 玩家碰到敌人也可以消灭（可选逻辑）
    // 这里仅作演示，实际可根据需求调整
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerWave}`);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        this.physics.velocityFromRotation(
          angle,
          this.enemySpeed,
          enemy.body.velocity
        );
      }
    });
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

const game = new Phaser.Game(config);

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    remainingEnemies: scene.remainingEnemies,
    isWaveActive: scene.isWaveActive,
    totalEnemies: scene.enemies.children.entries.length
  };
};