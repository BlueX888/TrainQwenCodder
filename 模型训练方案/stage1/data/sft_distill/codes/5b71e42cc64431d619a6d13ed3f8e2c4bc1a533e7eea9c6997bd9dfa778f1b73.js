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
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 初始化信号系统
window.__signals__ = {
  enemiesKilled: 0,
  particleExplosions: [],
  lastExplosionTime: 0
};

let enemy;
let particleEmitter;
let graphics;

function preload() {
  // 创建绿色敌人纹理
  graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('greenEnemy', 50, 50);
  graphics.destroy();
  
  // 创建粒子纹理（红色小圆点）
  graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1);
  graphics.fillCircle(5, 5, 5);
  graphics.generateTexture('particle', 10, 10);
  graphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 50, 'Click the Green Enemy to Explode!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加击杀计数显示
  const killText = this.add.text(400, 100, 'Enemies Killed: 0', {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建绿色敌人
  enemy = this.physics.add.sprite(400, 300, 'greenEnemy');
  enemy.setInteractive();
  
  // 创建粒子发射器
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 150, max: 250 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000, // 持续2秒
    gravityY: 0,
    quantity: 5, // 每次发射5个粒子
    blendMode: 'ADD',
    emitting: false // 初始不发射
  });
  
  // 敌人点击事件
  enemy.on('pointerdown', () => {
    if (enemy.active) {
      // 记录爆炸位置和时间
      const explosionData = {
        x: enemy.x,
        y: enemy.y,
        time: this.time.now,
        particleCount: 5
      };
      
      window.__signals__.particleExplosions.push(explosionData);
      window.__signals__.lastExplosionTime = this.time.now;
      window.__signals__.enemiesKilled++;
      
      // 更新显示
      killText.setText(`Enemies Killed: ${window.__signals__.enemiesKilled}`);
      
      // 在敌人位置发射粒子
      particleEmitter.explode(5, enemy.x, enemy.y);
      
      // 日志输出
      console.log(JSON.stringify({
        event: 'enemy_killed',
        position: { x: enemy.x, y: enemy.y },
        time: this.time.now,
        totalKills: window.__signals__.enemiesKilled
      }));
      
      // 销毁敌人
      enemy.destroy();
      
      // 2秒后重新生成敌人
      this.time.delayedCall(2000, () => {
        const randomX = Phaser.Math.Between(100, 700);
        const randomY = Phaser.Math.Between(150, 550);
        
        enemy = this.physics.add.sprite(randomX, randomY, 'greenEnemy');
        enemy.setInteractive();
        
        // 重新绑定点击事件
        enemy.on('pointerdown', () => {
          if (enemy.active) {
            const explosionData = {
              x: enemy.x,
              y: enemy.y,
              time: this.time.now,
              particleCount: 5
            };
            
            window.__signals__.particleExplosions.push(explosionData);
            window.__signals__.lastExplosionTime = this.time.now;
            window.__signals__.enemiesKilled++;
            
            killText.setText(`Enemies Killed: ${window.__signals__.enemiesKilled}`);
            
            particleEmitter.explode(5, enemy.x, enemy.y);
            
            console.log(JSON.stringify({
              event: 'enemy_killed',
              position: { x: enemy.x, y: enemy.y },
              time: this.time.now,
              totalKills: window.__signals__.enemiesKilled
            }));
            
            enemy.destroy();
            
            this.time.delayedCall(2000, arguments.callee.bind(this));
          }
        });
      });
    }
  });
  
  // 添加说明文本
  this.add.text(400, 550, 'Enemy respawns after 2 seconds', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 更新逻辑（如需要）
}

// 启动游戏
new Phaser.Game(config);