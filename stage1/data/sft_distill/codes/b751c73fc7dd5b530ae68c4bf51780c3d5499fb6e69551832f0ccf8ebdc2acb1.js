class ParticleShowcaseScene extends Phaser.Scene {
  constructor() {
    super('ParticleShowcaseScene');
    this.currentParticleIndex = 0;
    this.particleEmitter = null;
    this.infoText = null;
  }

  preload() {
    // 定义20种不同的颜色配置
    this.particleConfigs = [
      { name: 'Red Fire', color: 0xff0000, tint: [0xff0000, 0xff6600, 0xffaa00] },
      { name: 'Blue Water', color: 0x0066ff, tint: [0x0066ff, 0x00aaff, 0x00ffff] },
      { name: 'Green Nature', color: 0x00ff00, tint: [0x00ff00, 0x66ff66, 0xaaff00] },
      { name: 'Purple Magic', color: 0x9900ff, tint: [0x9900ff, 0xcc00ff, 0xff00ff] },
      { name: 'Yellow Sun', color: 0xffff00, tint: [0xffff00, 0xffcc00, 0xff9900] },
      { name: 'Orange Flame', color: 0xff6600, tint: [0xff6600, 0xff9933, 0xffcc66] },
      { name: 'Cyan Ice', color: 0x00ffff, tint: [0x00ffff, 0x66ffff, 0x99ffff] },
      { name: 'Pink Blossom', color: 0xff66cc, tint: [0xff66cc, 0xff99dd, 0xffccee] },
      { name: 'Lime Energy', color: 0xccff00, tint: [0xccff00, 0xddff33, 0xeeff66] },
      { name: 'Indigo Night', color: 0x4400ff, tint: [0x4400ff, 0x6633ff, 0x8866ff] },
      { name: 'Teal Ocean', color: 0x00cc99, tint: [0x00cc99, 0x33ddaa, 0x66eebb] },
      { name: 'Crimson Blood', color: 0xcc0033, tint: [0xcc0033, 0xdd3366, 0xee6699] },
      { name: 'Gold Treasure', color: 0xffcc00, tint: [0xffcc00, 0xffdd33, 0xffee66] },
      { name: 'Silver Moon', color: 0xcccccc, tint: [0xcccccc, 0xdddddd, 0xeeeeee] },
      { name: 'Violet Dream', color: 0xaa00cc, tint: [0xaa00cc, 0xcc33dd, 0xee66ff] },
      { name: 'Emerald Gem', color: 0x00cc66, tint: [0x00cc66, 0x33dd88, 0x66eeaa] },
      { name: 'Ruby Red', color: 0xff0066, tint: [0xff0066, 0xff3388, 0xff66aa] },
      { name: 'Sapphire Blue', color: 0x0033ff, tint: [0x0033ff, 0x3366ff, 0x6699ff] },
      { name: 'Amber Glow', color: 0xff9900, tint: [0xff9900, 0xffaa33, 0xffbb66] },
      { name: 'White Light', color: 0xffffff, tint: [0xffffff, 0xeeeeee, 0xdddddd] }
    ];
  }

  create() {
    // 创建粒子纹理（为每种颜色创建基础纹理）
    this.createParticleTextures();

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建信息文本
    this.infoText = this.add.text(400, 30, '', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 创建控制提示文本
    this.add.text(400, 570, 'Press LEFT/RIGHT arrows to switch particle effects', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 创建当前粒子发射器
    this.createParticleEmitter();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 防止按键重复触发
    this.lastKeyTime = 0;
    this.keyDelay = 200;

    // 更新信息显示
    this.updateInfo();
  }

  createParticleTextures() {
    // 为每种配置创建一个基础粒子纹理
    this.particleConfigs.forEach((config, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(config.color, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(`particle_${index}`, 16, 16);
      graphics.destroy();
    });
  }

  createParticleEmitter() {
    // 销毁旧的发射器
    if (this.particleEmitter) {
      this.particleEmitter.destroy();
    }

    const config = this.particleConfigs[this.currentParticleIndex];
    
    // 创建粒子发射器，每种类型有不同的效果
    const emitterConfig = this.getEmitterConfig(this.currentParticleIndex);
    
    this.particleEmitter = this.add.particles(400, 300, `particle_${this.currentParticleIndex}`, {
      ...emitterConfig,
      tint: config.tint
    });
  }

  getEmitterConfig(index) {
    // 为不同索引返回不同的粒子效果配置
    const configs = [
      // 0: Red Fire - 向上喷射
      { speed: { min: 100, max: 200 }, angle: { min: -100, max: -80 }, scale: { start: 1, end: 0 }, lifespan: 2000, frequency: 20 },
      // 1: Blue Water - 喷泉效果
      { speed: { min: 150, max: 250 }, angle: { min: -120, max: -60 }, scale: { start: 0.8, end: 0.2 }, lifespan: 1500, frequency: 15, gravityY: 200 },
      // 2: Green Nature - 环形扩散
      { speed: { min: 50, max: 150 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 1.5 }, lifespan: 3000, frequency: 30 },
      // 3: Purple Magic - 螺旋上升
      { speed: { min: 80, max: 120 }, angle: { min: -90, max: -90 }, scale: { start: 1.2, end: 0 }, lifespan: 2500, frequency: 10, gravityY: -50 },
      // 4: Yellow Sun - 爆炸效果
      { speed: { min: 200, max: 400 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 1000, frequency: 50, quantity: 2 },
      // 5: Orange Flame - 火焰摇曳
      { speed: { min: 50, max: 100 }, angle: { min: -110, max: -70 }, scale: { start: 1.5, end: 0.5 }, lifespan: 2000, frequency: 25, gravityY: -30 },
      // 6: Cyan Ice - 向下飘落
      { speed: { min: 30, max: 80 }, angle: { min: 70, max: 110 }, scale: { start: 0.8, end: 0.3 }, lifespan: 3000, frequency: 20, gravityY: 50 },
      // 7: Pink Blossom - 花瓣飘舞
      { speed: { min: 40, max: 100 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0.5 }, lifespan: 4000, frequency: 35, gravityY: 20 },
      // 8: Lime Energy - 脉冲效果
      { speed: { min: 100, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 0.3, end: 1.5 }, lifespan: 1500, frequency: 40 },
      // 9: Indigo Night - 星光闪烁
      { speed: { min: 20, max: 60 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 1.5 }, lifespan: 3500, frequency: 15, alpha: { start: 1, end: 0 } },
      // 10: Teal Ocean - 波浪效果
      { speed: { min: 60, max: 120 }, angle: { min: -20, max: 20 }, scale: { start: 1, end: 0.5 }, lifespan: 2500, frequency: 30, gravityY: 100 },
      // 11: Crimson Blood - 飞溅效果
      { speed: { min: 150, max: 300 }, angle: { min: -180, max: 0 }, scale: { start: 1.2, end: 0.2 }, lifespan: 1200, frequency: 45, gravityY: 300 },
      // 12: Gold Treasure - 闪光效果
      { speed: { min: 80, max: 160 }, angle: { min: 0, max: 360 }, scale: { start: 1.5, end: 0 }, lifespan: 2000, frequency: 20, alpha: { start: 1, end: 0.3 } },
      // 13: Silver Moon - 月光洒落
      { speed: { min: 30, max: 70 }, angle: { min: 60, max: 120 }, scale: { start: 0.6, end: 0.2 }, lifespan: 3500, frequency: 25, gravityY: 30 },
      // 14: Violet Dream - 梦幻漂浮
      { speed: { min: 40, max: 90 }, angle: { min: -100, max: -80 }, scale: { start: 1, end: 1.5 }, lifespan: 3000, frequency: 18, gravityY: -20 },
      // 15: Emerald Gem - 宝石闪耀
      { speed: { min: 100, max: 180 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0.2 }, lifespan: 1800, frequency: 35, alpha: { start: 1, end: 0.5 } },
      // 16: Ruby Red - 红宝石光芒
      { speed: { min: 120, max: 200 }, angle: { min: -110, max: -70 }, scale: { start: 1.2, end: 0.3 }, lifespan: 2200, frequency: 28 },
      // 17: Sapphire Blue - 蓝宝石光芒
      { speed: { min: 90, max: 160 }, angle: { min: 0, max: 360 }, scale: { start: 0.7, end: 1.3 }, lifespan: 2600, frequency: 22 },
      // 18: Amber Glow - 琥珀光晕
      { speed: { min: 50, max: 110 }, angle: { min: -100, max: -80 }, scale: { start: 1.5, end: 0.8 }, lifespan: 2800, frequency: 30, gravityY: -10 },
      // 19: White Light - 圣光普照
      { speed: { min: 70, max: 140 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 2400, frequency: 25, alpha: { start: 1, end: 0 } }
    ];

    return configs[index];
  }

  updateInfo() {
    const config = this.particleConfigs[this.currentParticleIndex];
    this.infoText.setText(`Particle Type ${this.currentParticleIndex + 1}/20: ${config.name}`);
    this.infoText.setColor(`#${config.color.toString(16).padStart(6, '0')}`);
  }

  update(time, delta) {
    // 处理键盘输入（带防抖）
    if (time - this.lastKeyTime > this.keyDelay) {
      if (this.cursors.left.isDown) {
        this.currentParticleIndex = (this.currentParticleIndex - 1 + 20) % 20;
        this.createParticleEmitter();
        this.updateInfo();
        this.lastKeyTime = time;
      } else if (this.cursors.right.isDown) {
        this.currentParticleIndex = (this.currentParticleIndex + 1) % 20;
        this.createParticleEmitter();
        this.updateInfo();
        this.lastKeyTime = time;
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111111',
  scene: ParticleShowcaseScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);