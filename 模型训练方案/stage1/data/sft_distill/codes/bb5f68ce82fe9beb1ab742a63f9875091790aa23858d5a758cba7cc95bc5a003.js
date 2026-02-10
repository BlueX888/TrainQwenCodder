class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.currentWave = 0;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家与敌人
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.killEnemy,
      null,
      this
    );

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 250;
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
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 检查是否所有敌人都被消灭
    if (this.isWaveActive && this.enemiesRemaining === 0) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete!\nNext wave in 2s...');
      
      // 2秒后开始下一波
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
        this.startNextWave();
      });
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;

    // 计算当前波次的敌人数量和速度
    const enemyCount = 2 + this.currentWave;
    const enemySpeed = 300 + (this.currentWave - 1) * 20;

    this.enemiesRemaining = enemyCount;

    // 更新UI
    this.updateUI();

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 300, () => {
        this.spawnEnemy(enemySpeed);
      });
    }

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(1500, () => {
      if (this.isWaveActive) {
        this.statusText.setText('');
      }
    });
  }

  spawnEnemy(speed) {
    // 随机选择屏幕边缘位置
    const edge = Phaser.Math.Between(0, 3);
    let x, y;

    switch (edge) {
      case 0: // 上边缘
        x = Phaser.Math.Between(0, 800);
        y = -32;
        break;
      case 1: // 右边缘
        x = 832;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下边缘
        x = Phaser.Math.Between(0, 800);
        y = 632;
        break;
      case 3: // 左边缘
        x = -32;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setData('speed', speed);
    
    // 设置敌人离开屏幕后销毁（防止无限追踪）
    enemy.setCollideWorldBounds(false);
  }

  killEnemy(player, enemy) {
    // 销毁敌人
    enemy.destroy();

    // 更新统计
    this.killCount++;
    this.enemiesRemaining--;

    // 更新UI
    this.updateUI();

    // 简单的击杀反馈（玩家闪烁）
    this.player.setAlpha(0.5);
    this.time.delayedCall(100, () => {
      this.player.setAlpha(1);
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);