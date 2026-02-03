// 波次敌人生成系统
class WaveSpawnerScene extends Phaser.Scene {
  constructor() {
    super('WaveSpawnerScene');
    this.currentWave = 0;
    this.enemiesPerWave = 8;
    this.enemySpeed = 80;
    this.isWaveActive = false;
    this.waveDelay = 2000; // 2秒延迟
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 碰撞检测：子弹与敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 48, 'Enemies: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, 'Status: Ready', {
      fontSize: '18px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shoot();
      this.lastFired = time;
    }

    // 更新敌人数量显示
    this.enemyCountText.setText(`Enemies: ${this.enemies.getLength()}`);

    // 检查是否所有敌人被消灭
    if (this.isWaveActive && this.enemies.getLength() === 0) {
      this.onWaveComplete();
    }

    // 移除超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < -10 || bullet.y > 610 || bullet.x < -10 || bullet.x > 810)) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.statusText.setText('Status: Fighting');
    this.statusText.setColor('#ff0000');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.spawnEnemy(i);
    }

    console.log(`Wave ${this.currentWave} started with ${this.enemiesPerWave} enemies`);
  }

  spawnEnemy(index) {
    // 使用固定模式生成位置（基于索引，保证确定性）
    const spacing = 800 / (this.enemiesPerWave + 1);
    const x = spacing * (index + 1);
    const y = 50 + (index % 2) * 30; // 交错排列

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      (index % 2 === 0 ? 1 : -1) * this.enemySpeed,
      this.enemySpeed * 0.5
    );
    enemy.setBounce(1, 1);
    enemy.setCollideWorldBounds(true);

    // 添加敌人数据
    enemy.setData('waveNumber', this.currentWave);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    
    enemy.destroy();

    console.log(`Enemy destroyed. Remaining: ${this.enemies.getLength()}`);
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.statusText.setText('Status: Wave Complete! Next wave in 2s...');
    this.statusText.setColor('#00ff00');

    console.log(`Wave ${this.currentWave} complete! Waiting 2 seconds...`);

    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: () => {
        this.startNextWave();
      },
      callbackScope: this
    });
  }

  shoot() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: WaveSpawnerScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemyCount: scene.enemies.getLength(),
    isWaveActive: scene.isWaveActive,
    enemiesPerWave: scene.enemiesPerWave,
    enemySpeed: scene.enemySpeed
  };
};